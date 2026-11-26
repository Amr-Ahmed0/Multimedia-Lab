# ============================================================================
# Course: Multimedia Systems & Programming
# Session: 06 - Color Models: CMY & CMYK with Python & OpenCV
# Instructor: Eng. Muhammad Ali Abdul Kareem — Sinai University
# ============================================================================

import os
import cv2
import numpy as np
import matplotlib.pyplot as plt

# ============================================================================
# 1. READ IMAGE & PREPARE ENVIRONMENT
# ============================================================================
# Colab: upload file to /content/flowers.jpg; Local: flowers.jpg in folder
image_path = '/content/flowers.jpg' if os.path.exists('/content/flowers.jpg') else 'flowers.jpg'
bgr_image = cv2.imread(image_path)

if bgr_image is None:
    print(f"Warning: '{image_path}' not found! Generating a synthetic sample image for demonstration.")
    # Create a synthetic 300x300 colorful test image with distinct RGB regions
    bgr_image = np.zeros((300, 300, 3), dtype=np.uint8)
    bgr_image[:150, :150] = [0, 0, 255]     # Red (OpenCV BGR order)
    bgr_image[:150, 150:] = [0, 255, 0]     # Green
    bgr_image[150:, :150] = [255, 0, 0]     # Blue
    bgr_image[150:, 150:] = [0, 255, 255]   # Yellow
    cv2.circle(bgr_image, (150, 150), 45, [255, 255, 255], -1)  # White center circle

print("Input image shape:", bgr_image.shape)

# ============================================================================
# 2. CMY COLOR MODEL (SUBTRACTIVE MODEL — 3 CHANNELS)
# ============================================================================
# Normalize image pixel values from [0, 255] to float [0.0, 1.0]
# Normalization allows complement subtraction: (1.0 - Light = Ink)
bgr_normalized = bgr_image / 255.0

# OpenCV loads images in BGR order (B, G, R)
# Split into channels:
B, G, R = cv2.split(bgr_normalized)

# Subtractive Color Formula:
# Cyan absorbs Red      -> C = 1.0 - R
# Magenta absorbs Green  -> M = 1.0 - G
# Yellow absorbs Blue   -> Y = 1.0 - B
C = 1.0 - R
M = 1.0 - G
Y = 1.0 - B

# Merge the complementary channels into a 3-channel CMY image
cmy_image = cv2.merge([C, M, Y])

# Convert back to uint8 [0, 255] using np.round to avoid off-by-one truncation
cmy_uint8 = np.round(cmy_image * 255.0).astype(np.uint8)

# Display CMY result (Matplotlib reads channels as RGB, displaying CMY negative)
plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.imshow(cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB))
plt.title("Original Image (RGB)")
plt.axis("off")

plt.subplot(1, 2, 2)
plt.imshow(cmy_uint8)
plt.title("CMY Image (Negative of RGB)")
plt.axis("off")
plt.tight_layout()
plt.show()

# ============================================================================
# 3. CMYK COLOR MODEL (PRINTING MODEL — 4 CHANNELS)
# ============================================================================
# In practical printing, combining 100% C + M + Y produces muddy dark brown
# rather than true pure black, and wastes ink.
# Hence, the K (Key / Black) channel is introduced.

# Convert original BGR to standard RGB order first
rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
rgb_normalized = rgb_image / 255.0

# Split into R, G, B channels
r, g, b = cv2.split(rgb_normalized)

# Step 3.1: Calculate K (Black channel)
# K = 1 - max(R, G, B)
# np.maximum compares arrays element-wise:
k = 1.0 - np.maximum(np.maximum(r, g), b)

# Step 3.2: Calculate C, M, Y channels adjusted for the black ink
# Formula: C = (1 - R - K) / (1 - K)
# Notice: For pure black pixels (R=0, G=0, B=0), K = 1.0, making the denominator 1 - K = 0.
# To prevent division by zero or NaN, add an epsilon guard (+ 1e-10):
eps = 1e-10
c = (1.0 - r - k) / (1.0 - k + eps)
m = (1.0 - g - k) / (1.0 - k + eps)
y = (1.0 - b - k) / (1.0 - k + eps)

# Step 3.3: Merge into a 4-channel CMYK array
cmyk_image = cv2.merge([c, m, y, k])
cmyk_uint8 = np.round(cmyk_image * 255.0).astype(np.uint8)

# ============================================================================
# 4. CMYK DISPLAY & PREVIEW TRAP
# ============================================================================
# Note: plt.imshow treats any 4-channel array as RGBA (K treated as Alpha).
# To accurately preview real CMYK inks, we plot each ink separation individually:

fig, axes = plt.subplots(1, 4, figsize=(14, 3.5))
channels = [("Cyan (C)", c), ("Magenta (M)", m), ("Yellow (Y)", y), ("Black (K)", k)]
for ax, (title, ch) in zip(axes, channels):
    ax.imshow(ch, cmap="gray_r")  # gray_r: darker pixels represent more ink
    ax.set_title(title, fontsize=12, fontweight="bold")
    ax.axis("off")
plt.suptitle("CMYK Individual Ink Separations (Darker = More Ink)", fontsize=14, y=1.02)
plt.tight_layout()
plt.show()

# Reconstruct RGB from CMYK to verify color accuracy:
# Reconstructed RGB = 255 * (1 - C) * (1 - K)
reconstructed_rgb = 255.0 * (1.0 - cmyk_image[..., :3]) * (1.0 - cmyk_image[..., 3:])
reconstructed_rgb = np.round(reconstructed_rgb).astype(np.uint8)

plt.figure(figsize=(6, 5))
plt.imshow(reconstructed_rgb)
plt.title("Reconstructed RGB from CMYK")
plt.axis("off")
plt.show()

# ============================================================================
# 5. STUDENT PRACTICE TASK: SINGLE-PIXEL CMYK CONVERTER
# ============================================================================
# Task: Write a function rgb_to_cmyk(r, g, b) for a single pixel (0-255 inputs)
# returning normalized (0.0-1.0) CMYK values, guarded with 1e-10.

def rgb_to_cmyk(r, g, b):
    # Normalize inputs to 0.0 - 1.0
    rn, gn, bn = r / 255.0, g / 255.0, b / 255.0
    
    # Calculate K (Black)
    k_val = 1.0 - max(rn, gn, bn)
    
    # Denominator with epsilon guard for black pixels (k_val = 1.0)
    denominator = 1.0 - k_val + 1e-10
    
    # Calculate C, M, Y
    c_val = (1.0 - rn - k_val) / denominator
    m_val = (1.0 - gn - k_val) / denominator
    y_val = (1.0 - bn - k_val) / denominator
    
    return c_val, m_val, y_val, k_val

# Test with standard benchmark colors:
test_colors = [
    ("Pure White", (255, 255, 255)),
    ("Pure Black", (0, 0, 0)),
    ("Pure Red",   (255, 0, 0)),
    ("Pure Green", (0, 255, 0)),
    ("Pure Blue",  (0, 0, 255)),
    ("Yellow",     (255, 255, 0)),
]

print("\n" + "=" * 50)
print("Single-Pixel RGB to CMYK Verification:")
print("=" * 50)
for name, (cr, cg, cb) in test_colors:
    c_out, m_out, y_out, k_out = rgb_to_cmyk(cr, cg, cb)
    print(f"{name:12} RGB({cr:3}, {cg:3}, {cb:3}) -> CMYK({c_out:.2f}, {m_out:.2f}, {y_out:.2f}, {k_out:.2f})")
print("=" * 50)
