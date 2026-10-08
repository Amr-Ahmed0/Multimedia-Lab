# ⚙️ Multimedia Lab - Processing Module (OpenCV / Pillow / NumPy)

This directory will contain the core Image Processing logic implemented in Python using **OpenCV**, **Pillow (PIL)**, and **NumPy**.

---

## 🔬 Operations & Mathematical Formulations

### 1. Grayscale Conversion
- **OpenCV**: `cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)`
- **Formula**: \( Y = 0.299 \times R + 0.587 \times G + 0.114 \times B \)

### 2. Resizing
- **OpenCV**: `cv2.resize(img, (width, height), interpolation=cv2.INTER_CUBIC)`

### 3. Rotation
- **OpenCV**: `cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)`, `cv2.ROTATE_180`, `cv2.ROTATE_90_COUNTERCLOCKWISE`

### 4. Flip
- **OpenCV**: `cv2.flip(img, flipCode)` (0 = vertical, 1 = horizontal, -1 = both)

### 5. Gaussian Blur
- **OpenCV**: `cv2.GaussianBlur(img, (kernel_size, kernel_size), 0)`

### 6. Brightness & Contrast Adjustment
- **Formula**: \( g(x,y) = \alpha \times f(x,y) + \beta \)
- **NumPy / OpenCV**: `cv2.convertScaleAbs(img, alpha=contrast_factor, beta=brightness_offset)`

### 7. Edge Detection (Sobel / Canny)
- **Sobel**: `cv2.Sobel(img, cv2.CV_64F, 1, 0, ksize=5)`
- **Canny**: `cv2.Canny(img, threshold1=100, threshold2=200)`

---

## 🛠️ Python Module Architecture (Target Layout)

```text
processing/
├── __init__.py
├── grayscale.py
├── transform.py        # Resize, Rotate, Flip
├── filters.py          # Blur, Brightness, Contrast
└── edges.py            # Sobel, Canny edge detection
```
