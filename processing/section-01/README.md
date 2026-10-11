# 🔊 Session 01 — Digital Sound: Synthesis, Sampling, Quantization & DAC

**Course:** Multimedia Systems & Programming  
**Institution:** Sinai University  
**Instructor:** Eng. Muhammad Ali Abdul Kareem  

---

## 🎯 Learning Objectives

This session demonstrates how a continuous acoustic or electrical wave is transformed into discrete digital audio that computers can process, store, and transmit, and how it is subsequently reconstructed back to an analog signal:

1. **Continuous Signal Synthesis:** Modeling analog sound waves mathematically using sine functions $y(t) = \sin(2\pi f t)$.
2. **Gain & Amplitude (Loudness) Control:** Adjusting volume through scalar multiplication without changing the frequency/pitch of the tone.
3. **ADC Time Discretization (Sampling):** Converting continuous time into discrete intervals ($t_s$) and understanding the **Nyquist-Shannon Sampling Theorem** ($F_s \ge 2 f_{\max}$) to prevent aliasing distortion.
4. **ADC Amplitude Discretization (Quantization):** Mapping continuous analog voltages into finite discrete digital levels ($L = 2^{\text{bits}}$) and analyzing quantization noise.
5. **DAC Reconstruction (Zero-Order Hold):** Reconstructing the discrete digital samples into a continuous staircase voltage signal.

---

## 🔬 Scientific Concepts & Mathematical Formulations

### 1. Analog Sine Wave Synthesis
- **Formula:** $y(t) = \sin(2\pi \cdot f \cdot t)$
- **Parameters:**
  - $f$: Frequency in Hertz (Hz) — cycles per second.
  - $t$: Time vector in seconds.

### 2. Loudness / Gain Control
- **Formula:** $y_{\text{amp}}(t) = g \cdot y(t)$
- **Gain ($g$):**
  - $g > 1.0$: Amplification (increased volume).
  - $g < 1.0$: Attenuation (decreased volume / quiet wave).
  - $g = 1.0$: Unity gain (original amplitude).
- *Nominal Range Note:* Digital audio DAC converters normalize full scale to $[-1.0, 1.0]$. Gain exceeding $1.0$ can cause digital clipping distortion if not scaled.

### 3. Sampling & The Nyquist-Shannon Theorem
- **Discrete Time Grid:** $t_s = \frac{n}{F_s}, \quad n \in \{0, 1, \dots, N-1\}$
- **Nyquist Rate:** $R_{\text{Nyquist}} = 2 \cdot f_{\max}$
- **Condition:**
  - $F_s > 2 f_{\max}$: Safe sampling (No aliasing).
  - $F_s = 2 f_{\max}$: Theoretical minimum boundary (sensitive to sampling phase; zero-crossings can cause signal loss).
  - $F_s < 2 f_{\max}$: Under-sampling (Aliasing occurs — high frequencies fold back into false low frequencies $|F_s - f|$).

### 4. Quantization (Bit Depth)
- **Levels ($L$):** $L = 2^b$, where $b$ is the number of bits.
- **Formulation:**
  $$x = \frac{\text{sampled} + 1}{2} \times (L - 1)$$
  $$\text{quantized} = \frac{\text{round}(x)}{L - 1} \times 2 - 1$$
- **Step Size (Resolution):** $\Delta = \frac{2}{L - 1}$
- **Bit Depths:**
  - $1\text{ bit} \implies 2\text{ levels}$ (binary sign representation)
  - $3\text{ bits} \implies 8\text{ levels}$ (coarse audio)
  - $8\text{ bits} \implies 256\text{ levels}$ (vintage audio quality)
  - $16\text{ bits} \implies 65,536\text{ levels}$ (standard CD audio quality)

### 5. DAC Zero-Order Hold (ZOH) Reconstruction
- Each quantized digital sample is held at a constant voltage level for a duration of $T_s = \frac{1}{F_s}$ until the subsequent sample clock arrival.
- Produces a staircase waveform, which in physical hardware is subsequently smoothed by an analog low-pass reconstruction filter (anti-imaging filter).

---

## 💻 Running the Python Reference Script

To execute the original reference script and see Matplotlib plots:

```bash
# 1. Install dependencies
pip install numpy matplotlib

# 2. Run the session script
python processing/section-01/session_01_digital_sound.py
```

### Expected Terminal Output:
```text
Task 1: Quiet wave max amplitude = 0.50

Task 2: Testing Sampling Rates for 5 Hz wave:
  Fs =  7 Hz -> Aliasing!
  Fs = 10 Hz -> Aliasing! (Strict: Fs > 2*freq)
  Fs = 30 Hz -> OK (Safe, No Aliasing)

Task 3: Bit Depths & Quantization Levels:
  1 bit(s) =   2 levels
  3 bit(s) =   8 levels
  8 bit(s) = 256 levels
```

---

## 🌐 Relationship to the Web Application

In the **Multimedia Lab** web interface:
- **`frontend/js/audio.js`** provides an interactive client-side simulation implementing the exact mathematical formulas from `session_01_digital_sound.py`.
- Interactive graphs update live when sliders for **Frequency**, **Gain**, **Sampling Rate**, and **Bit Depth** are modified.
- Audio playback using the browser's **Web Audio API** allows students to audibly experience the generated frequency and amplitude changes.
- Pre-configured student task buttons verify the exercises directly in the browser interface.
