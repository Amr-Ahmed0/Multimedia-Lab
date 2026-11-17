# ============================================================================
# Course: Multimedia Systems & Programming
# Session: 05 - Image Histogram with Python & OpenCV
# Instructor: Eng. Muhammad Ali Abdul Kareem — Sinai University
# ============================================================================

import os
import cv2
import numpy as np
import matplotlib.pyplot as plt

# ============================================================================
# 1. READ IMAGES (GRAYSCALE & COLOR)
# ============================================================================
# Colab: upload file to /content/image_name.jpg; Local: image_name.jpg in folder
image_path = '/content/image_name.jpg' if os.path.exists('/content/image_name.jpg') else 'image_name.jpg'

gray = cv2.imread(image_path, 0)
img = cv2.imread(image_path)

if gray is None:
    print(f"Error: image not found at '{image_path}'! Check the path.")
else:
    flat = gray.ravel()
    print("gray.shape:", gray.shape)   # (H, W)
    print("flat.shape:", flat.shape)   # (H * W,)

    # ============================================================================
    # 2. HISTOGRAM WITH PLT.HIST (MATPLOTLIB)
    # ============================================================================
    plt.hist(gray.ravel(), bins=256, range=(0, 256))
    plt.title('plt.hist')
    plt.xlabel('Pixel intensity (0-255)')
    plt.ylabel('Number of pixels')
    plt.show()

    # ============================================================================
    # 3. MANUAL COUNTING WITH NP.ZEROS
    # ============================================================================
    hist_manual = np.zeros(256, dtype=int)   # 256 empty buckets
    for row in gray:                         # every row of the image
        for pixel in row:                    # every pixel in that row
            hist_manual[pixel] += 1          # add 1 to its bucket

    plt.plot(hist_manual)
    plt.title('Manual Counting Histogram')
    plt.xlabel('Pixel intensity')
    plt.ylabel('Number of pixels')
    plt.show()

    # ============================================================================
    # 4. HISTOGRAM WITH CV2.CALCHIST (GRAYSCALE)
    # ============================================================================
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    print("hist.shape:", hist.shape)   # (256, 1)
    print("pixels with value 0:", hist[0])

    plt.plot(hist)
    plt.xlim([0, 256])
    plt.title('calcHist (gray)')
    plt.xlabel('Pixel intensity')
    plt.ylabel('Number of pixels')
    plt.show()

    # ============================================================================
    # 5. COLOR HISTOGRAM (BGR CHANNELS)
    # ============================================================================
    for i, col in enumerate(('b', 'g', 'r')):
        h = cv2.calcHist([img], [i], None, [256], [0, 256])
        plt.plot(h, color=col)

    plt.xlim([0, 256])
    plt.title('calcHist (color)')
    plt.xlabel('Pixel intensity')
    plt.ylabel('Number of pixels')
    plt.show()

    # ============================================================================
    # 6. HISTOGRAM MASKING (SPECIFIC REGIONS)
    # ============================================================================
    mask = np.zeros(gray.shape, np.uint8)   # all black
    mask[50:150, 50:150] = 255              # white square

    hist_masked = cv2.calcHist([gray], [0], mask, [256], [0, 256])
    plt.plot(hist_masked)
    plt.title('Masked Region Histogram')
    plt.show()

    # ============================================================================
    # 7. STUDENT PRACTICE TASKS SOLUTION
    # ============================================================================
    # Task 1: 16-bin histogram
    hist16 = cv2.calcHist([gray], [0], None, [16], [0, 256])
    print("\nTask 1 - 16-bin hist shape:", hist16.shape)                  # (16, 1)

    # Task 2: Verify total count equals total pixels (H * W)
    hist_all = cv2.calcHist([gray], [0], None, [256], [0, 256])
    print("Task 2 - hist.sum() vs H*W:", hist_all.sum(), gray.shape[0] * gray.shape[1])   # equal

    # Task 3: Histogram of top half with a mask
    mask_top = np.zeros(gray.shape, np.uint8)
    mask_top[:gray.shape[0] // 2, :] = 255   # top half only
    top_hist = cv2.calcHist([gray], [0], mask_top, [256], [0, 256])
    print("Task 3 - Top half pixels:", top_hist.sum())                     # about half of H * W
