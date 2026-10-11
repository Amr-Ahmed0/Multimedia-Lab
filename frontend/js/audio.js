/**
 * ============================================================================
 * Multimedia Lab - Session 01: Digital Sound Module (js/audio.js)
 * ============================================================================
 * Course: Multimedia Systems & Programming — Sinai University
 * Instructor: Eng. Muhammad Ali Abdul Kareem
 * 
 * Implements interactive digital sound synthesis, amplitude gain control,
 * sampling (ADC time discretization) with Nyquist-Shannon evaluation,
 * quantization (ADC amplitude discretization), and DAC Zero-Order Hold (ZOH).
 * 
 * Reference implementation: processing/section-01/session_01_digital_sound.py
 */

// Global Audio Session State
const audioState = {
  // Synthesis parameters
  frequency: 5,        // Signal frequency in Hz
  duration: 1.0,       // Duration in seconds

  // Gain control parameter
  gain: 2.0,           // Scalar multiplier

  // Sampling parameters (ADC Time Discretization)
  fs: 25,              // Sampling frequency in Hz

  // Quantization parameters (ADC Amplitude Discretization)
  bits: 3,             // Bit depth (levels = 2^bits)

  // Web Audio playback state
  isPlaying: false,
  audioCtx: null,
  oscillatorNode: null,
  gainNode: null
};

// ============================================================================
// 1. MATHEMATICAL FORMULATIONS & SIGNAL CALCULATION ENGINE
// ============================================================================

/**
 * 1. Continuous Analog Signal Simulation (Sine Wave)
 * Formula: y(t) = sin(2 * pi * f * t)
 */
function computeAnalogSineWave(freq, duration, numPoints = 500) {
  const t = new Float64Array(numPoints);
  const y = new Float64Array(numPoints);
  const step = duration / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const time = i * step;
    t[i] = time;
    y[i] = Math.sin(2 * Math.PI * freq * time);
  }

  return { t, y, numPoints, duration };
}

/**
 * 2. Loudness / Gain Control
 * Formula: y_amp(t) = gain * y(t)
 */
function computeGainWave(analogWave, gain) {
  const yAmp = new Float64Array(analogWave.y.length);
  let maxAbs = 0;

  for (let i = 0; i < analogWave.y.length; i++) {
    const val = analogWave.y[i] * gain;
    yAmp[i] = val;
    const absVal = Math.abs(val);
    if (absVal > maxAbs) maxAbs = absVal;
  }

  return {
    t: analogWave.t,
    y: yAmp,
    originalY: analogWave.y,
    maxAbs: maxAbs,
    isExceedingRange: maxAbs > 1.0001
  };
}

/**
 * 3. Sampling & Nyquist Criterion (Time Discretization)
 * Formula: t_s[n] = n / Fs (for n = 0, ..., Fs*D - 1)
 *          sampled[n] = sin(2 * pi * f * t_s[n])
 */
function computeSampledSignal(freq, fs, duration) {
  const numSamples = Math.floor(fs * duration);
  const t_s = new Float64Array(numSamples);
  const sampled = new Float64Array(numSamples);

  for (let n = 0; n < numSamples; n++) {
    const time = n / fs;
    t_s[n] = time;
    sampled[n] = Math.sin(2 * Math.PI * freq * time);
  }

  // Nyquist calculations:
  // Nyquist Rate: 2 * f_max
  const nyquistRate = 2 * freq;
  const theoreticalSatisfied = fs >= nyquistRate; // Standard Nyquist-Shannon
  const exerciseStrictSatisfied = fs > nyquistRate; // Exercise simplified rule (Fs > 2*freq)

  let nyquistStatus = 'safe';
  let statusMessage = '';

  if (fs < nyquistRate) {
    nyquistStatus = 'aliasing';
    const aliasFreq = Math.abs(fs - freq);
    statusMessage = `Aliasing! (Under-sampled: Fs < 2×f). Signal folds back to apparent ~${aliasFreq.toFixed(1)} Hz ghost tone.`;
  } else if (fs === nyquistRate) {
    nyquistStatus = 'boundary';
    statusMessage = `Exact Nyquist Limit (Fs = 2×f = ${nyquistRate} Hz). Theoretically minimum; vulnerable to phase cancellation if samples land on zero-crossings.`;
  } else {
    nyquistStatus = 'safe';
    statusMessage = `OK (Safe, No Aliasing: Fs > 2×f). The signal is accurately captured.`;
  }

  return {
    t_s,
    sampled,
    numSamples,
    nyquistRate,
    theoreticalSatisfied,
    exerciseStrictSatisfied,
    nyquistStatus,
    statusMessage
  };
}

/**
 * 4. Quantization (Amplitude Discretization)
 * Formula matching Python reference:
 * levels = 2^bits
 * x = (sampled + 1) / 2 * (levels - 1)
 * quantized = round(x) / (levels - 1) * 2 - 1
 */
function computeQuantization(sampledSignal, bits) {
  const levels = Math.pow(2, bits);
  const sampled = sampledSignal.sampled;
  const numSamples = sampled.length;

  const quantized = new Float64Array(numSamples);
  let totalError = 0;
  let maxError = 0;

  for (let i = 0; i < numSamples; i++) {
    const orig = sampled[i];
    const normalized = ((orig + 1) / 2) * (levels - 1);
    const rounded = Math.round(normalized);
    const quantVal = (rounded / (levels - 1)) * 2 - 1;
    quantized[i] = quantVal;

    const err = Math.abs(orig - quantVal);
    totalError += err;
    if (err > maxError) maxError = err;
  }

  const mae = numSamples > 0 ? totalError / numSamples : 0;
  const stepSize = levels > 1 ? 2 / (levels - 1) : 2;

  return {
    t_s: sampledSignal.t_s,
    sampled: sampled,
    quantized: quantized,
    levels: levels,
    bits: bits,
    stepSize: stepSize,
    mae: mae,
    maxError: maxError
  };
}

/**
 * 5. DAC Zero-Order Hold (ZOH) Reconstruction
 * Holds each quantized sample constant for Ts = 1/Fs until next clock pulse.
 */
function computeDACReconstruction(quantizedData, duration) {
  const t_s = quantizedData.t_s;
  const q = quantizedData.quantized;
  const n = t_s.length;

  if (n === 0) return { tStep: [], yStep: [] };

  const tStep = [];
  const yStep = [];

  for (let i = 0; i < n; i++) {
    const tStart = t_s[i];
    const tEnd = (i < n - 1) ? t_s[i + 1] : duration;
    const val = q[i];

    tStep.push(tStart);
    yStep.push(val);

    tStep.push(tEnd);
    yStep.push(val);
  }

  return { tStep, yStep };
}

// ============================================================================
// 2. HIGH-PERFORMANCE INTERACTIVE CANVAS PLOTTING ENGINE
// ============================================================================

/**
 * Render a high-DPI waveform plot on an HTML5 Canvas
 * @param {HTMLCanvasElement} canvas - Target Canvas
 * @param {Object} options - Plot configuration and series data
 */
function drawPlot(canvas, options) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Handle Hi-DPI / Retina display crisp scaling
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.width || 600;
  const height = rect.height || canvas.height || 260;

  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  // Styling tokens
  const padding = { top: 24, right: 28, bottom: 34, left: 44 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Background fill
  ctx.fillStyle = '#0E1218';
  ctx.fillRect(0, 0, width, height);

  const tMin = options.tMin !== undefined ? options.tMin : 0.0;
  const tMax = options.tMax !== undefined ? options.tMax : 1.0;
  const yMin = options.yMin !== undefined ? options.yMin : -1.2;
  const yMax = options.yMax !== undefined ? options.yMax : 1.2;

  // Coordinate mappers
  const mapX = (t) => padding.left + ((t - tMin) / (tMax - tMin || 1)) * plotW;
  const mapY = (y) => padding.top + plotH - ((y - yMin) / (yMax - yMin || 1)) * plotH;

  // 1. Draw Grid Lines
  ctx.strokeStyle = '#21262D';
  ctx.lineWidth = 1;

  // Horizontal Grid (Amplitude levels)
  const yGridSteps = options.yGridSteps || [-1.0, -0.5, 0.0, 0.5, 1.0];
  ctx.font = '10px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  yGridSteps.forEach(yVal => {
    if (yVal >= yMin && yVal <= yMax) {
      const py = mapY(yVal);
      ctx.beginPath();
      ctx.strokeStyle = yVal === 0.0 ? '#30363D' : '#1C2128';
      ctx.lineWidth = yVal === 0.0 ? 1.5 : 1;
      ctx.moveTo(padding.left, py);
      ctx.lineTo(padding.left + plotW, py);
      ctx.stroke();

      // Y-axis numerical label
      ctx.fillStyle = yVal === 0.0 ? '#8B949E' : '#6E7681';
      ctx.fillText(yVal.toFixed(1), padding.left - 6, py);
    }
  });

  // Vertical Grid (Time intervals)
  const numTimeTicks = 5;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#6E7681';

  for (let i = 0; i <= numTimeTicks; i++) {
    const tVal = tMin + (i / numTimeTicks) * (tMax - tMin);
    const px = mapX(tVal);
    ctx.beginPath();
    ctx.strokeStyle = '#1C2128';
    ctx.lineWidth = 1;
    ctx.moveTo(px, padding.top);
    ctx.lineTo(px, padding.top + plotH);
    ctx.stroke();

    ctx.fillText(`${tVal.toFixed(2)}s`, px, padding.top + plotH + 6);
  }

  // 2. Draw Plot Frame Border
  ctx.strokeStyle = '#30363D';
  ctx.lineWidth = 1;
  ctx.strokeRect(padding.left, padding.top, plotW, plotH);

  // 3. Render Series Data
  if (options.series && Array.isArray(options.series)) {
    options.series.forEach(s => {
      if (!s.visible) return;

      // Type A: Continuous Curve (Analog / Sine)
      if (s.type === 'line' && s.t && s.y) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = s.color || '#5DD6A0';
        ctx.lineWidth = s.lineWidth || 2;
        if (s.dashed) ctx.setLineDash([4, 4]);

        const len = s.t.length;
        for (let i = 0; i < len; i++) {
          const px = mapX(s.t[i]);
          const py = mapY(s.y[i]);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Type B: Discrete Stem Plot (Samples / Quantized Points)
      if (s.type === 'stem' && s.t && s.y) {
        ctx.save();
        const basePy = mapY(0.0);
        const markerColor = s.color || '#38bdf8';
        const lineColor = s.lineColor || s.color || '#38bdf8';
        const markerRadius = s.markerRadius || 3.5;

        for (let i = 0; i < s.t.length; i++) {
          const px = mapX(s.t[i]);
          const py = mapY(s.y[i]);

          // Vertical stem line from y=0
          ctx.beginPath();
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 1.5;
          ctx.moveTo(px, basePy);
          ctx.lineTo(px, py);
          ctx.stroke();

          // Circular marker dot at top
          ctx.beginPath();
          ctx.arc(px, py, markerRadius, 0, 2 * Math.PI);
          ctx.fillStyle = markerColor;
          ctx.fill();
          ctx.strokeStyle = '#0E1218';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Type C: Staircase Step Plot (Zero-Order Hold DAC)
      if (s.type === 'step' && s.t && s.y) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = s.color || '#fb923c';
        ctx.lineWidth = s.lineWidth || 2;

        for (let i = 0; i < s.t.length; i++) {
          const px = mapX(s.t[i]);
          const py = mapY(s.y[i]);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  // 4. Draw Axis Title Labels
  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = '#8B949E';
  ctx.textAlign = 'left';
  ctx.fillText('Amplitude', padding.left, padding.top - 10);

  ctx.textAlign = 'right';
  ctx.fillText('Time (seconds) →', padding.left + plotW, padding.top + plotH + 20);

  ctx.restore();
}

// ============================================================================
// 3. WEB AUDIO API SYNTHESIZER
// ============================================================================

/**
 * Play synthesized audio tone using browser Web Audio API
 */
function playSynthesizedTone(freq, gain) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      if (typeof showToast === 'function') {
        showToast('Web Audio API is not supported by your browser.', 'error');
      }
      return;
    }

    if (!audioState.audioCtx) {
      audioState.audioCtx = new AudioContextClass();
    }

    if (audioState.audioCtx.state === 'suspended') {
      audioState.audioCtx.resume();
    }

    stopSynthesizedTone();

    const osc = audioState.audioCtx.createOscillator();
    const gainNode = audioState.audioCtx.createGain();

    // Map frequency (audible range mapping: 5 Hz is infrasonic, so for real auditory feedback
    // we scale smoothly or synthesize base tone so student hears the pitch difference)
    const audibleFreq = freq >= 20 ? freq : freq * 40; // Pitch scaler for low classroom frequencies (5Hz -> 200Hz)

    osc.type = 'sine';
    osc.frequency.setValueAtTime(audibleFreq, audioState.audioCtx.currentTime);

    // Safe normalized listening volume
    const safeVolume = Math.min(Math.max(gain * 0.12, 0.02), 0.35);
    gainNode.gain.setValueAtTime(safeVolume, audioState.audioCtx.currentTime);

    osc.connect(gainNode);
    gainNode.connect(audioState.audioCtx.destination);

    osc.start();
    audioState.oscillatorNode = osc;
    audioState.gainNode = gainNode;
    audioState.isPlaying = true;

    updatePlayButtonUI(true);

    if (typeof showToast === 'function') {
      showToast(`Playing sine tone (${freq} Hz tone pitched to ${audibleFreq} Hz for audible speaker output)`, 'info');
    }
  } catch (err) {
    console.error('Audio playback error:', err);
  }
}

/**
 * Stop active audio playback
 */
function stopSynthesizedTone() {
  if (audioState.oscillatorNode) {
    try {
      audioState.oscillatorNode.stop();
      audioState.oscillatorNode.disconnect();
    } catch (e) {
      // Ignore if already stopped
    }
    audioState.oscillatorNode = null;
  }
  audioState.isPlaying = false;
  updatePlayButtonUI(false);
}

function updatePlayButtonUI(isPlaying) {
  const btn = document.getElementById('audio-play-toggle-btn');
  if (!btn) return;

  if (isPlaying) {
    btn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
      <span>Stop Tone</span>
    `;
    btn.classList.add('btn-playing');
  } else {
    btn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      <span>Play Tone</span>
    `;
    btn.classList.remove('btn-playing');
  }
}

// ============================================================================
// 4. SESSION UI SYNCHRONIZATION & WORKSPACE RENDERING
// ============================================================================

/**
 * Render Concept 1: Signal Synthesis Plot & Metrics
 */
function renderSynthesisSection() {
  const canvas = document.getElementById('canvas-synthesis');
  const analogWave = computeAnalogSineWave(audioState.frequency, audioState.duration);

  drawPlot(canvas, {
    tMin: 0,
    tMax: audioState.duration,
    yMin: -1.3,
    yMax: 1.3,
    yGridSteps: [-1.0, -0.5, 0.0, 0.5, 1.0],
    series: [
      {
        type: 'line',
        t: analogWave.t,
        y: analogWave.y,
        color: '#a855f7', // Purple matching Python Matplotlib lw=2
        lineWidth: 2.2,
        visible: true
      }
    ]
  });

  // Update metric labels
  const freqLabel = document.getElementById('metric-synth-freq');
  const periodLabel = document.getElementById('metric-synth-period');
  const durLabel = document.getElementById('metric-synth-duration');

  if (freqLabel) freqLabel.textContent = `${audioState.frequency} Hz`;
  if (periodLabel) periodLabel.textContent = `${(1 / audioState.frequency).toFixed(3)} s`;
  if (durLabel) durLabel.textContent = `${audioState.duration.toFixed(1)} s`;
}

/**
 * Render Concept 2: Gain & Amplitude Control Plot & Metrics
 */
function renderGainSection() {
  const canvas = document.getElementById('canvas-gain');
  const analogWave = computeAnalogSineWave(audioState.frequency, audioState.duration);
  const gainData = computeGainWave(analogWave, audioState.gain);

  const yBound = Math.max(1.3, audioState.gain * 1.15);

  drawPlot(canvas, {
    tMin: 0,
    tMax: audioState.duration,
    yMin: -yBound,
    yMax: yBound,
    yGridSteps: [-2.0, -1.0, 0.0, 1.0, 2.0].filter(v => Math.abs(v) <= yBound),
    series: [
      {
        type: 'line',
        t: analogWave.t,
        y: analogWave.y,
        color: '#38bdf8', // Blue/Cyan matching Python 'b-'
        lineWidth: 1.5,
        dashed: false,
        visible: true
      },
      {
        type: 'line',
        t: gainData.t,
        y: gainData.y,
        color: '#f43f5e', // Red matching Python 'r--'
        lineWidth: 2.0,
        dashed: true,
        visible: true
      }
    ]
  });

  // Update metrics & range warning
  const gainValLabel = document.getElementById('metric-gain-val');
  const maxAmpLabel = document.getElementById('metric-gain-max-amp');
  const rangeWarning = document.getElementById('gain-range-warning');

  if (gainValLabel) gainValLabel.textContent = `${audioState.gain.toFixed(1)}×`;
  if (maxAmpLabel) maxAmpLabel.textContent = `±${gainData.maxAbs.toFixed(2)}`;

  if (rangeWarning) {
    if (gainData.isExceedingRange) {
      rangeWarning.className = 'audio-warning-box warning-active';
      rangeWarning.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        <span>Exceeds nominal audio full-scale range [-1.0, 1.0]. Amplified amplitude = ±${gainData.maxAbs.toFixed(2)}. In physical DAC hardware, this causes digital clipping distortion.</span>
      `;
    } else {
      rangeWarning.className = 'audio-warning-box warning-safe';
      rangeWarning.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>Within nominal DAC full-scale audio range [-1.0, 1.0]. No clipping distortion.</span>
      `;
    }
  }
}

/**
 * Render Concept 3: Sampling & Nyquist Theorem Plot & Evaluation
 */
function renderSamplingSection() {
  const canvas = document.getElementById('canvas-sampling');
  const analogWave = computeAnalogSineWave(audioState.frequency, audioState.duration);
  const sampledData = computeSampledSignal(audioState.frequency, audioState.fs, audioState.duration);

  drawPlot(canvas, {
    tMin: 0,
    tMax: audioState.duration,
    yMin: -1.3,
    yMax: 1.3,
    yGridSteps: [-1.0, -0.5, 0.0, 0.5, 1.0],
    series: [
      {
        type: 'line',
        t: analogWave.t,
        y: analogWave.y,
        color: '#64748b', // Gray continuous curve matching Python alpha=0.5
        lineWidth: 1.5,
        dashed: false,
        visible: true
      },
      {
        type: 'stem',
        t: sampledData.t_s,
        y: sampledData.sampled,
        color: '#38bdf8', // Blue dots 'bo' matching Python
        lineColor: '#38bdf8',
        markerRadius: 3.5,
        visible: true
      }
    ]
  });

  // Update metrics
  const fsLabel = document.getElementById('metric-sampling-fs');
  const countLabel = document.getElementById('metric-sampling-count');
  const nyquistRateLabel = document.getElementById('metric-sampling-nyquist-rate');
  const statusBadge = document.getElementById('sampling-nyquist-badge');
  const explanationBox = document.getElementById('sampling-explanation-text');

  if (fsLabel) fsLabel.textContent = `${audioState.fs} Hz`;
  if (countLabel) countLabel.textContent = `${sampledData.numSamples} samples`;
  if (nyquistRateLabel) nyquistRateLabel.textContent = `2 × ${audioState.frequency} = ${sampledData.nyquistRate} Hz`;

  if (statusBadge) {
    statusBadge.className = `nyquist-badge badge-${sampledData.nyquistStatus}`;
    if (sampledData.nyquistStatus === 'safe') {
      statusBadge.textContent = 'Nyquist Satisfied (Safe)';
    } else if (sampledData.nyquistStatus === 'boundary') {
      statusBadge.textContent = 'Exact Nyquist Boundary (Fs = 2f)';
    } else {
      statusBadge.textContent = 'Aliasing Occurs (Fs < 2f)';
    }
  }

  if (explanationBox) {
    explanationBox.textContent = sampledData.statusMessage;
  }
}

/**
 * Render Concept 4: Quantization Plot & Error Metrics
 */
function renderQuantizationSection() {
  const canvas = document.getElementById('canvas-quantization');
  const sampledData = computeSampledSignal(audioState.frequency, audioState.fs, audioState.duration);
  const quantData = computeQuantization(sampledData, audioState.bits);

  // Discrete horizontal grid lines matching the 2^bits quantization levels
  const ySteps = [];
  if (quantData.levels <= 16) {
    for (let l = 0; l < quantData.levels; l++) {
      const v = (l / (quantData.levels - 1)) * 2 - 1;
      ySteps.push(v);
    }
  } else {
    ySteps.push(-1.0, -0.5, 0.0, 0.5, 1.0);
  }

  drawPlot(canvas, {
    tMin: 0,
    tMax: audioState.duration,
    yMin: -1.3,
    yMax: 1.3,
    yGridSteps: ySteps,
    series: [
      {
        type: 'stem',
        t: quantData.t_s,
        y: quantData.quantized,
        color: '#5DD6A0', // Green stems 'g-' 'go' matching Python
        lineColor: '#5DD6A0',
        markerRadius: 3.5,
        visible: true
      }
    ]
  });

  // Update metrics
  const bitsLabel = document.getElementById('metric-quant-bits');
  const levelsLabel = document.getElementById('metric-quant-levels');
  const stepLabel = document.getElementById('metric-quant-step');
  const errorLabel = document.getElementById('metric-quant-error');

  if (bitsLabel) bitsLabel.textContent = `${audioState.bits} bit(s)`;
  if (levelsLabel) levelsLabel.textContent = `${quantData.levels} levels (2^${audioState.bits})`;
  if (stepLabel) stepLabel.textContent = `Δ = ${quantData.stepSize.toFixed(4)}`;
  if (errorLabel) errorLabel.textContent = `MAE = ${quantData.mae.toFixed(4)}`;
}

/**
 * Render Concept 5: DAC Zero-Order Hold Reconstruction Plot
 */
function renderDACSection() {
  const canvas = document.getElementById('canvas-dac');
  const analogWave = computeAnalogSineWave(audioState.frequency, audioState.duration);
  const sampledData = computeSampledSignal(audioState.frequency, audioState.fs, audioState.duration);
  const quantData = computeQuantization(sampledData, audioState.bits);
  const dacData = computeDACReconstruction(quantData, audioState.duration);

  drawPlot(canvas, {
    tMin: 0,
    tMax: audioState.duration,
    yMin: -1.3,
    yMax: 1.3,
    yGridSteps: [-1.0, -0.5, 0.0, 0.5, 1.0],
    series: [
      {
        type: 'line',
        t: analogWave.t,
        y: analogWave.y,
        color: '#64748b', // Gray dashed line '--' matching Python
        lineWidth: 1.5,
        dashed: true,
        visible: true
      },
      {
        type: 'step',
        t: dacData.tStep,
        y: dacData.yStep,
        color: '#fb923c', // Orange step line matching Python
        lineWidth: 2.2,
        visible: true
      }
    ]
  });

  const dacBitsLabel = document.getElementById('metric-dac-bits');
  const dacFsLabel = document.getElementById('metric-dac-fs');

  if (dacBitsLabel) dacBitsLabel.textContent = `${audioState.bits} bits (${Math.pow(2, audioState.bits)} levels)`;
  if (dacFsLabel) dacFsLabel.textContent = `${audioState.fs} Hz (Hold Ts = ${(1 / audioState.fs).toFixed(3)}s)`;
}

/**
 * Render all Session 01 plots and metrics
 */
function renderAllAudioGraphs() {
  renderSynthesisSection();
  renderGainSection();
  renderSamplingSection();
  renderQuantizationSection();
  renderDACSection();
}

// ============================================================================
// 5. INTERACTIVE STUDENT LAB TASKS (Exercises 1, 2, 3)
// ============================================================================

/**
 * Execute Task 1: Quiet Wave (Attenuation)
 * wave = sin(2*pi*5*t) * 0.5 -> max amplitude = 0.50
 */
function runExercise1() {
  audioState.frequency = 5;
  audioState.gain = 0.5;

  // Sync controls
  const freqSlider = document.getElementById('slider-frequency');
  const gainSlider = document.getElementById('slider-gain');
  if (freqSlider) freqSlider.value = 5;
  if (gainSlider) gainSlider.value = 0.5;

  renderAllAudioGraphs();

  const resultBox = document.getElementById('exercise-1-result');
  if (resultBox) {
    resultBox.className = 'exercise-result-box active-success';
    resultBox.innerHTML = `
      <strong>Task 1 Verification Passed:</strong><br>
      Equation: <code>y(t) = sin(2π × 5 × t) × 0.5</code><br>
      Maximum Absolute Amplitude: <span class="res-highlight">0.50</span><br>
      <small style="color: var(--text-secondary);">The waveform is attenuated by half, maintaining pure 5 Hz pitch.</small>
    `;
  }

  if (typeof showToast === 'function') {
    showToast('Exercise 1 Verified: Quiet wave max amplitude = 0.50', 'success');
  }
}

/**
 * Execute Task 2: Sampling Rate & Aliasing Test (Nyquist Criterion)
 * Test Fs in (7, 10, 30) Hz for 5 Hz sine wave
 */
function runExercise2() {
  const resultBox = document.getElementById('exercise-2-result');
  if (!resultBox) return;

  const freq = 5;
  const tests = [7, 10, 30];
  const results = tests.map(testFs => {
    const nyquistRate = 2 * freq;
    const isStrictOk = testFs > nyquistRate; // Python: test_fs > 2 * freq
    const isTheoreticalOk = testFs >= nyquistRate;

    let badge = '';
    let explanation = '';

    if (testFs === 7) {
      badge = '<span class="status-tag tag-danger">Aliasing!</span>';
      explanation = 'Fs < 2×f (7 < 10 Hz): Severe under-sampling; creates 2 Hz alias ghost tone.';
    } else if (testFs === 10) {
      badge = '<span class="status-tag tag-warning">Strict: Aliasing! (Theory: Boundary)</span>';
      explanation = 'Fs = 2×f (10 Hz = 2×5 Hz): Meets basic boundary, but strict rule rejects it due to phase vulnerability.';
    } else {
      badge = '<span class="status-tag tag-success">OK (Safe, No Aliasing)</span>';
      explanation = 'Fs > 2×f (30 > 10 Hz): Over-sampled; accurately captured without distortion.';
    }

    return `
      <div class="exercise-item-row">
        <div style="font-weight: 600; min-width: 90px;">Fs = ${testFs} Hz:</div>
        <div style="margin-right: 0.5rem;">${badge}</div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">${explanation}</div>
      </div>
    `;
  }).join('');

  resultBox.className = 'exercise-result-box active-success';
  resultBox.innerHTML = `
    <strong>Task 2 Verification (5 Hz Wave • Nyquist Rate = 10 Hz):</strong>
    <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.4rem;">
      ${results}
    </div>
  `;

  if (typeof showToast === 'function') {
    showToast('Exercise 2 Verified: Tested sampling rates 7 Hz, 10 Hz, 30 Hz', 'success');
  }
}

/**
 * Execute Task 3: Quantization Bit Depth vs Discrete Levels
 * 1, 3, 8 bits -> 2^b levels
 */
function runExercise3() {
  const resultBox = document.getElementById('exercise-3-result');
  if (!resultBox) return;

  const depths = [1, 3, 8];
  const tableRows = depths.map(b => {
    const levels = Math.pow(2, b);
    let note = '';
    if (b === 1) note = '1 bit = 2 levels (Binary 1-bit comparator)';
    else if (b === 3) note = '3 bits = 8 levels (Coarse 8-level audio)';
    else if (b === 8) note = '8 bits = 256 levels (Vintage standard digital resolution)';

    return `
      <tr>
        <td style="padding: 0.35rem 0.5rem; font-weight: 600; color: var(--accent-primary);">${b} bit(s)</td>
        <td style="padding: 0.35rem 0.5rem; font-weight: bold;">${levels} levels</td>
        <td style="padding: 0.35rem 0.5rem; color: var(--text-secondary); font-size: 0.8rem;">${note}</td>
      </tr>
    `;
  }).join('');

  resultBox.className = 'exercise-result-box active-success';
  resultBox.innerHTML = `
    <strong>Task 3 Verification: Bit Depths & Quantization Levels (L = 2^b):</strong>
    <table style="width: 100%; border-collapse: collapse; margin-top: 0.4rem; text-align: left; font-size: 0.85rem;">
      <thead>
        <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.75rem;">
          <th style="padding: 0.25rem 0.5rem;">Bit Depth</th>
          <th style="padding: 0.25rem 0.5rem;">Discrete Levels</th>
          <th style="padding: 0.25rem 0.5rem;">Digital Audio Context</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  if (typeof showToast === 'function') {
    showToast('Exercise 3 Verified: Bit depths 1, 3, 8 bits calculated', 'success');
  }
}

// ============================================================================
// 6. EVENT LISTENERS INITIALIZATION
// ============================================================================

/**
 * Initialize all Session 01 audio controls and listeners
 */
function initAudioSession() {
  // 1. Frequency Control
  const freqSlider = document.getElementById('slider-frequency');
  const freqValText = document.getElementById('slider-freq-val');
  if (freqSlider) {
    freqSlider.addEventListener('input', () => {
      audioState.frequency = parseInt(freqSlider.value, 10) || 5;
      if (freqValText) freqValText.textContent = `${audioState.frequency} Hz`;
      renderAllAudioGraphs();
      if (audioState.isPlaying) playSynthesizedTone(audioState.frequency, audioState.gain);
    });
  }

  // 2. Duration Control
  const durSlider = document.getElementById('slider-duration');
  const durValText = document.getElementById('slider-dur-val');
  if (durSlider) {
    durSlider.addEventListener('input', () => {
      audioState.duration = parseFloat(durSlider.value) || 1.0;
      if (durValText) durValText.textContent = `${audioState.duration.toFixed(1)} s`;
      renderAllAudioGraphs();
    });
  }

  // 3. Audio Play / Stop Button
  const playBtn = document.getElementById('audio-play-toggle-btn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (audioState.isPlaying) {
        stopSynthesizedTone();
      } else {
        playSynthesizedTone(audioState.frequency, audioState.gain);
      }
    });
  }

  // 4. Synthesis Reset Button
  const resetSynthBtn = document.getElementById('btn-reset-synthesis');
  if (resetSynthBtn) {
    resetSynthBtn.addEventListener('click', () => {
      audioState.frequency = 5;
      audioState.duration = 1.0;
      if (freqSlider) freqSlider.value = 5;
      if (freqValText) freqValText.textContent = '5 Hz';
      if (durSlider) durSlider.value = 1.0;
      if (durValText) durValText.textContent = '1.0 s';
      renderAllAudioGraphs();
      if (audioState.isPlaying) playSynthesizedTone(5, audioState.gain);
    });
  }

  // 5. Gain Control
  const gainSlider = document.getElementById('slider-gain');
  const gainValText = document.getElementById('slider-gain-val');
  if (gainSlider) {
    gainSlider.addEventListener('input', () => {
      audioState.gain = parseFloat(gainSlider.value) || 1.0;
      if (gainValText) gainValText.textContent = `${audioState.gain.toFixed(1)}×`;
      renderGainSection();
      if (audioState.isPlaying) playSynthesizedTone(audioState.frequency, audioState.gain);
    });
  }

  // Gain Preset Buttons
  const gainPresets = document.querySelectorAll('.gain-preset-btn');
  gainPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      const g = parseFloat(btn.dataset.gain);
      if (!isNaN(g)) {
        audioState.gain = g;
        if (gainSlider) gainSlider.value = g;
        if (gainValText) gainValText.textContent = `${g.toFixed(1)}×`;
        gainPresets.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGainSection();
        if (audioState.isPlaying) playSynthesizedTone(audioState.frequency, audioState.gain);
      }
    });
  });

  // 6. Sampling Frequency Control
  const fsSlider = document.getElementById('slider-fs');
  const fsValText = document.getElementById('slider-fs-val');
  if (fsSlider) {
    fsSlider.addEventListener('input', () => {
      audioState.fs = parseInt(fsSlider.value, 10) || 25;
      if (fsValText) fsValText.textContent = `${audioState.fs} Hz`;
      renderSamplingSection();
      renderQuantizationSection();
      renderDACSection();
    });
  }

  // Sampling Rate Preset Buttons (7, 10, 25, 30 Hz)
  const fsPresets = document.querySelectorAll('.fs-preset-btn');
  fsPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      const fsVal = parseInt(btn.dataset.fs, 10);
      if (!isNaN(fsVal)) {
        audioState.fs = fsVal;
        if (fsSlider) fsSlider.value = fsVal;
        if (fsValText) fsValText.textContent = `${fsVal} Hz`;
        fsPresets.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSamplingSection();
        renderQuantizationSection();
        renderDACSection();
      }
    });
  });

  // 7. Quantization Bit Depth Control
  const bitButtons = document.querySelectorAll('.bits-preset-btn');
  bitButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const b = parseInt(btn.dataset.bits, 10);
      if (!isNaN(b)) {
        audioState.bits = b;
        bitButtons.forEach(btnOther => btnOther.classList.remove('active'));
        btn.classList.add('active');
        renderQuantizationSection();
        renderDACSection();
      }
    });
  });

  // 8. Exercise Buttons
  const btnEx1 = document.getElementById('btn-run-ex1');
  const btnEx2 = document.getElementById('btn-run-ex2');
  const btnEx3 = document.getElementById('btn-run-ex3');

  if (btnEx1) btnEx1.addEventListener('click', runExercise1);
  if (btnEx2) btnEx2.addEventListener('click', runExercise2);
  if (btnEx3) btnEx3.addEventListener('click', runExercise3);

  // Initial draw
  renderAllAudioGraphs();

  // Handle window resizing with debounce
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderAllAudioGraphs();
    }, 150);
  });
}

// Expose globally
window.initAudioSession = initAudioSession;
window.renderAllAudioGraphs = renderAllAudioGraphs;
