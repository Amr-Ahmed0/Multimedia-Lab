# ============================================================================
# Course: Multimedia Systems & Programming
# Session: 01 - Digital Sound: Synthesis, Sampling, Quantization & DAC
# Instructor: Eng. Muhammad Ali Abdul Kareem — Sinai University
# ============================================================================

import numpy as np
import matplotlib.pyplot as plt

# ============================================================================
# 1. ANALOG SIGNAL SIMULATION (SINE WAVE)
# ============================================================================
# Formula: y(t) = sin(2 * pi * f * t)
freq = 5  # Frequency in Hz (cycles per second)
t = np.linspace(0, 1.0, 500)
sine = np.sin(2 * np.pi * freq * t)

plt.figure(figsize=(8, 4))
plt.plot(t, sine, label="Analog Sine (5 Hz)", color='#a855f7', lw=2)
plt.title("1. Analog Signal Simulation (Continuous Sine Wave)")
plt.xlabel("Time (s)")
plt.ylabel("Amplitude")
plt.grid(True, alpha=0.3)
plt.legend()
plt.show()

# ============================================================================
# 2. LOUDNESS / GAIN CONTROL
# ============================================================================
# Multiplying the waveform by a scalar gain adjusts volume/amplitude.
gain = 2.0
loud = sine * gain

plt.figure(figsize=(8, 4))
plt.plot(t, sine, 'b-', label="Original Wave (Gain = 1.0)")
plt.plot(t, loud, 'r--', label=f"Amplified Wave (Gain = {gain})")
plt.title("2. Loudness Adjustment via Gain")
plt.xlabel("Time (s)")
plt.ylabel("Amplitude")
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# ============================================================================
# 3. SAMPLING & NYQUIST THEOREM (ADC TIME DISCRETIZATION)
# ============================================================================
# Nyquist-Shannon Theorem: Fs > 2 * f_max to avoid Aliasing.
fs = 25  # Sampling frequency in Hz (samples per second)
t_s = np.linspace(0, 1.0, fs, endpoint=False)
sampled = np.sin(2 * np.pi * freq * t_s)

plt.figure(figsize=(8, 4))
plt.plot(t, sine, 'gray', alpha=0.5, label="Original Analog Wave")
plt.stem(t_s, sampled, linefmt='b-', markerfmt='bo', basefmt=' ')
plt.title(f"3. Sampling: Fs = {fs} Hz (Nyquist Rate = {2 * freq} Hz)")
plt.xlabel("Time (s)")
plt.ylabel("Amplitude")
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# ============================================================================
# 4. QUANTIZATION (ADC AMPLITUDE DISCRETIZATION)
# ============================================================================
# Discretizing continuous voltage into 2^bits levels.
bits = 3
levels = 2 ** bits
x = (sampled + 1) / 2 * (levels - 1)
quantized = np.round(x) / (levels - 1) * 2 - 1

plt.figure(figsize=(8, 4))
plt.stem(t_s, quantized, linefmt='g-', markerfmt='go', basefmt=' ')
plt.title(f"4. Quantization: {bits} Bits = {levels} Discrete Levels")
plt.xlabel("Time (s)")
plt.ylabel("Quantized Amplitude")
plt.grid(True, alpha=0.3)
plt.show()

# ============================================================================
# 5. DAC RECONSTRUCTION (ZERO-ORDER HOLD)
# ============================================================================
# Zero-Order Hold (ZOH) holds each sample value constant until the next sample.
plt.figure(figsize=(8, 4))
plt.plot(t, sine, '--', alpha=0.5, label="Original Analog Wave", color='gray')
plt.step(t_s, quantized, where='post', label=f"DAC Output (ZOH, {bits} bits)", color='orange', lw=2)
plt.title("5. DAC Zero-Order Hold Reconstruction")
plt.xlabel("Time (s)")
plt.ylabel("Reconstructed Voltage")
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# ============================================================================
# STUDENT TASKS & SOLUTIONS
# ============================================================================

# Task 1: Quiet Wave (Attenuation)
wave = np.sin(2 * np.pi * 5 * t)
quiet = wave * 0.5
print(f"Task 1: Quiet wave max amplitude = {quiet.max():.2f}")

# Task 2: Sampling Rate & Aliasing Test (Nyquist Criterion)
print("\nTask 2: Testing Sampling Rates for 5 Hz wave:")
for test_fs in (7, 10, 30):
    ok = test_fs > 2 * freq
    status = "OK (Safe, No Aliasing)" if ok else "Aliasing!"
    print(f"  Fs = {test_fs:2d} Hz -> {status}")

# Task 3: Quantization Bit Depth vs Discrete Levels
print("\nTask 3: Bit Depths & Quantization Levels:")
for b in (1, 3, 8):
    print(f"  {b} bit(s) = {2 ** b:3d} levels")
