# 📊 Session 03 — Image Histogram with Python & OpenCV

**Course:** Multimedia Systems & Programming  
**Institution:** Sinai University  
**Instructor:** Eng. Muhammad Ali Abdul Kareem  

---

## 🎯 Learning Objectives

This session explores how image histograms represent the statistical distribution of pixel intensities across an image, how color channels are analyzed independently, how specific spatial regions are isolated using binary masks, and how manual algorithm implementations compare with optimized scientific library routines:

1. **Grayscale Intensity Distribution:** Flattening 2D spatial matrices `(Height, Width)` into 1D arrays `(H * W,)` with `gray.ravel()` and analyzing intensity occurrence frequencies across discrete bins $[0, 255]$.
2. **Matplotlib Visual Plotting:** Visualizing frequency distributions directly using `plt.hist(gray.ravel(), bins=256, range=(0, 256))`.
3. **Manual Algorithmic Counting (`np.zeros`):** Implementing raw histogram bin accumulation without pre-packaged library functions:
   ```python
   hist_manual = np.zeros(256, dtype=int)
   for row in gray:
       for pixel in row:
           hist_manual[pixel] += 1
   ```
4. **Optimized OpenCV Histogram (`cv2.calcHist`):** Leveraging optimized C++ primitives:
   `cv2.calcHist(images=[gray], channels=[0], mask=None, histSize=[256], ranges=[0, 256])`
5. **Multi-Channel Color Histograms:** Extracting and overlaying individual histograms for Blue, Green, and Red channels:
   `for i, col in enumerate(('b', 'g', 'r')): cv2.calcHist([img], [i], None, [256], [0, 256])`
6. **Region-Specific Masking:** Applying spatial binary masks ($255$ for ROI, $0$ elsewhere) to compute localized histograms of specific features or image halves.
7. **Curriculum Practice Exercises:**
   - **Task 1:** 16-bin quantization histogram (`histSize=[16]`).
   - **Task 2:** Mathematical verification that histogram sum equals total matrix resolution ($H \times W$).
   - **Task 3:** Top-half spatial region masking (`mask[:H // 2, :] = 255`).

---

## 🔬 Scientific Concepts & Mathematical Formulations

### 1. Digital Image Histogram
An image histogram $h(r_k)$ is a discrete function mapping intensity level $r_k$ to the number of pixels $n_k$ having that intensity:
$$h(r_k) = n_k, \quad k \in \{0, 1, \dots, L-1\}$$
where $L = 256$ for standard 8-bit digital images.

Normalized histogram (probability distribution):
$$p(r_k) = \frac{n_k}{M \times N}$$
where $M$ is the image height and $N$ is the image width.

### 2. Manual Bucket Accumulation vs. `cv2.calcHist`
- **Manual approach:** Allocates an array of size $L$ initialized to zero. For every coordinate $(x, y)$, increments bucket $B[\text{pixel}(x, y)] \leftarrow B[\text{pixel}(x, y)] + 1$.
- **OpenCV `cv2.calcHist`:** Executes in hardware-accelerated SIMD instructions, producing identical numerical output with $O(M \times N)$ efficiency.

### 3. Spatial Masking
A binary mask matrix $M(x, y) \in \{0, 255\}$ constrains calculation:
$$h_{\text{masked}}(r_k) = \sum_{y=0}^{H-1} \sum_{x=0}^{W-1} \begin{cases} 1 & \text{if } f(x, y) = r_k \text{ and } M(x,y) = 255 \\ 0 & \text{otherwise} \end{cases}$$
Sum of all bins in $h_{\text{masked}}$ is guaranteed to equal $\sum M(x,y) / 255$.

---

## 💻 Running the Python Reference Script

To execute the session reference script:

```bash
# 1. Activate project virtual environment or install dependencies
pip install numpy matplotlib opencv-python

# 2. Run the session script
python section-03/section-03.py
```

### Expected Terminal Output:
```text
gray.shape: (H, W)
flat.shape: (H * W,)
hist.shape: (256, 1)
pixels with value 0: [N]

Task 1 - 16-bin hist shape: (16, 1)
Task 2 - hist.sum() vs H*W: TotalPixels TotalPixels
Task 3 - Top half pixels: ExpectedTopHalfPixels
```

---

## 🧪 Automated Testing

To run the automated test suite for Section 03:

```bash
python -m unittest section-03/test_section03.py
```

Expected test result:
```text
.....
----------------------------------------------------------------------
Ran 5 tests in 0.180s

OK
```

---

## 🌐 Web Application & FastAPI Backend Integration

- **Frontend Interface (`frontend/js/section03.js` & `frontend/index.html`):**
  - Interactive HTML5 Canvas 2D charts with real-time mouse hover pixel inspections.
  - Bin resolution selector ($16, 32, 64, 128, 256$ bins).
  - Multi-channel BGR curve overlays.
  - Interactive Region Mask visualizer (Full Image, Square ROI $50:150$, and Top Half).
  - 1-click automated verifiers for Student Tasks 1, 2, and 3.
- **FastAPI REST Backend (`backend/`):**
  - `POST /api/section03/histogram`: Generates statistical histogram payloads and charts.
  - `POST /api/section03/mask`: Computes ROI masked distributions.
  - `POST /api/section03/verify`: Evaluates student curriculum tasks on the server.
