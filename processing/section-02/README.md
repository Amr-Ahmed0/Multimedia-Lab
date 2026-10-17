# 🖼️ Session 02 — Digital Images with OpenCV: Matrices, Colors, Thresholding & Spatial Transforms

**Course:** Multimedia Systems & Programming  
**Institution:** Sinai University  
**Instructor:** Eng. Muhammad Ali Abdul Kareem  

---

## 🎯 Learning Objectives

This session explores how digital images are represented in memory as multi-dimensional matrices, how color channels operate, and how foundational spatial and intensity transformations are applied using Python, NumPy, OpenCV, and Matplotlib:

1. **Digital Image Matrix Representation:** Understanding images as 3D NumPy arrays `(Height, Width, Channels)` with `uint8` data types $[0, 255]$ and OpenCV's native **BGR** (Blue, Green, Red) channel ordering.
2. **Grayscale Conversion (Luminance Reduction):** Transforming 3-channel color data into a 1-channel luminance map using the standard ITU-R 601 luma formula:
   $$\text{Gray} = 0.299 \times R + 0.587 \times G + 0.114 \times B$$
3. **Binary Thresholding (Image Segmentation):** Discretizing continuous grayscale intensities into binary states (pure black $0$ vs. pure white $255$) using `cv2.threshold`:
   $$\text{dst}(x,y) = \begin{cases} 255 & \text{if } \text{src}(x,y) > T \\ 0 & \text{otherwise} \end{cases}$$
4. **Spatial Resizing:** Scaling 2D discrete coordinate grids using `cv2.resize` with interpolation, highlighting OpenCV's `(Width, Height)` parameter order versus NumPy's `(Height, Width)` array index order.
5. **Orthogonal Image Rotation:** Rotating images in fixed $90^\circ$ steps (`cv2.ROTATE_90_CLOCKWISE`, `cv2.ROTATE_180`, `cv2.ROTATE_90_COUNTERCLOCKWISE`) and analyzing matrix dimension transposition.
6. **Scientific Visualization with Matplotlib:** Display parameters including BGR-to-RGB channel reordering, suppressing coordinate axes (`plt.axis('off')`), and applying the mandatory `cmap='gray'` colormap to prevent false-color viridis heatmaps.

---

## 🔬 Scientific Concepts & Mathematical Formulations

### 1. Matrix Representation of Digital Images
- An image with $H$ rows, $W$ columns, and $C$ channels is represented as a NumPy array of shape $(H, W, C)$.
- **Channel Order:**
  - OpenCV: **BGR** (Blue = index 0, Green = index 1, Red = index 2).
  - Standard RGB / Web / Matplotlib: **RGB** (Red = index 0, Green = index 1, Blue = index 2).
- **Data Type:** `numpy.uint8` storing integers in range $[0, 255]$.
- Top-left origin: Coordinate $(0, 0)$ is at row 0, column 0.

### 2. RGB/BGR to Grayscale Conversion
- **Formula:**
  $$Y = 0.299 \cdot R + 0.587 \cdot G + 0.114 \cdot B$$
- Human perception is most sensitive to green wavelengths and least sensitive to blue, reflected in the weighted coefficients.
- **Dimensionality:** Array changes from $(H, W, 3)$ to $(H, W)$ — reducing memory footprint by $66.7\%$.

### 3. Binary Thresholding
- **Threshold Criterion:**
  $$\text{Binary}(x,y) = \begin{cases} 255 & \text{if } \text{Gray}(x,y) > T \\ 0 & \text{if } \text{Gray}(x,y) \le T \end{cases}$$
- For standard threshold $T = 127$:
  - Pixels $> 127$ map to white ($255$).
  - Pixels $\le 127$ map to black ($0$).
- Lowering $T$ (e.g., $T = 100$) increases the proportion of white pixels, while raising $T$ increases the proportion of black pixels.

### 4. Image Resizing (`cv2.resize`)
- **Coordinate Order:** `cv2.resize(src, (new_width, new_height))`
  - *Note:* The tuple parameter is `(Width, Height)` / `(X, Y)`, whereas NumPy array shape is `(Rows, Cols)` = `(Height, Width)`.
- Resized array shape: `(new_height, new_width, channels)`.

### 5. Orthogonal Rotation (`cv2.rotate`)
- **`cv2.ROTATE_90_CLOCKWISE`:** Swaps Height and Width $\implies$ shape becomes $(W, H, C)$.
- **`cv2.ROTATE_180`:** Inverts both axes without changing dimension $\implies$ shape remains $(H, W, C)$.
- **`cv2.ROTATE_90_COUNTERCLOCKWISE`:** $270^\circ$ clockwise rotation $\implies$ shape becomes $(W, H, C)$.

### 6. Matplotlib Display Parameters (`plt.imshow`)
1. **RGB Reordering:** `cv2.cvtColor(img, cv2.COLOR_BGR2RGB)` ensures reds and blues are not flipped.
2. **Axis Ticks:** `plt.axis('off')` suppresses graph ticks $(0, 100, 200, \dots)$ for clean presentation.
3. **Colormap:** Single-channel images require `cmap='gray'`. Without this parameter, Matplotlib defaults to the `viridis` heatmap, rendering grayscale images in false green and purple colors.

---

## 💻 Running the Python Reference Script

To execute the session script:

```bash
# 1. Activate project virtual environment or install dependencies
pip install numpy matplotlib opencv-python

# 2. Run the session script
python processing/section-02/session02_digital_images.py
```

### Expected Terminal Output:

```text
=== 1. Input Image Properties ===
Image shape : (H, W, 3)
Data type   : uint8
Pixel [0, 0]: [B, G, R]

=== 2. Grayscale Conversion ===
Gray shape : (H, W)
Gray pixel : <intensity>

=== 3. Binary Thresholding ===
Binary shape : (H, W)
Binary values: only 0 and 255

=== 4. Resizing Image ===
Resized shape: (300, 300, 3)

=== 5. Rotating Image ===
Rotated 90° shape : (W, H, 3)
Rotated 180° shape: (H, W, 3)

=== 6. Plotting Images with Matplotlib ===

=== 7. Student Practice Task Solution ===
• Binary (T=100) created -> lower threshold = more white pixels
• task_resized.shape: (150, 150, 3)
• task_rotated_180.shape: (H, W, 3)
• task_rotated_90.shape : (W, H, 3)
```

---

## 🧪 Automated Testing

To run the automated test suite for Section 2:

```bash
python -m unittest processing/section-02/test_session02.py
```

---

## 🌐 Relationship to the Web Application

In the **Multimedia Lab** web interface:
- **`frontend/js/section02.js`** implements interactive client-side simulations matching `session02_digital_images.py`.
- **Interactive Concept Cards:**
  1. **NumPy Properties & Pixel Inspector:** Interactive mouse hover and click inspector displaying coordinate $(x, y)$, BGR and RGB channel values, and hex swatches.
  2. **Grayscale Conversion:** Real-time luminance calculation with split comparison.
  3. **Binary Thresholding:** Live slider for $T \in [0, 255]$ with preset buttons ($T=64, 100, 127, 180$) and white/black pixel distribution metrics.
  4. **Spatial Resizing:** Dynamic width and height scaling controls with aspect ratio lock.
  5. **Orthogonal Rotation:** Instant $90^\circ, 180^\circ, 270^\circ$ transformations with dimension tracking.
  6. **Matplotlib Parameters Simulation:** Toggles for BGR vs. RGB channel ordering, coordinate axes visibility, and `cmap='gray'` vs. `viridis` colormap visualization.
  7. **Student Lab Exercises & Solutions:** 4 interactive verification buttons directly validating Tasks 1, 2, 3, and 4 from the curriculum.
