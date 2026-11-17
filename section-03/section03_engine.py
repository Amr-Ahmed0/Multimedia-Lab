# ============================================================================
# Course: Multimedia Systems & Programming
# Session: 03 (Curriculum Session 05) - Image Histogram with Python & OpenCV
# Processing Core Engine
# Instructor: Eng. Muhammad Ali Abdul Kareem — Sinai University
# ============================================================================

import os
import cv2
import numpy as np

def resolve_default_image_path():
    """
    Locates the default curriculum sample image.
    Checks section-03 directory, then section-02, then frontend assets.
    """
    candidates = [
        os.path.join(os.path.dirname(__file__), "image_name.jpg"),
        os.path.join(os.path.dirname(__file__), "../processing/section-02/image_name.jpg"),
        os.path.join(os.path.dirname(__file__), "../frontend/assets/images/hero_landscape.jpg"),
        "/content/image_name.jpg",
        "image_name.jpg"
    ]
    for c in candidates:
        if os.path.exists(c):
            return os.path.abspath(c)
    return None

def load_image(image_input=None):
    """
    Loads grayscale and color BGR images.
    image_input can be:
      - None (uses default sample image)
      - str (file path)
      - bytes (encoded image bytes)
      - numpy.ndarray (already decoded BGR image)
    Returns (gray, img) tuple.
    """
    if image_input is None:
        path = resolve_default_image_path()
        if path is None:
            # Fallback synthetic gradient image (200x200) for testing
            img = np.zeros((200, 200, 3), dtype=np.uint8)
            img[:, :, 0] = np.linspace(0, 255, 200, dtype=np.uint8)
            img[:, :, 1] = np.linspace(50, 200, 200, dtype=np.uint8)
            img[:, :, 2] = 128
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            return gray, img
        gray = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
        img = cv2.imread(path, cv2.IMREAD_COLOR)
        return gray, img

    if isinstance(image_input, str):
        if not os.path.exists(image_input):
            raise FileNotFoundError(f"Image not found at path: {image_input}")
        gray = cv2.imread(image_input, cv2.IMREAD_GRAYSCALE)
        img = cv2.imread(image_input, cv2.IMREAD_COLOR)
        return gray, img

    if isinstance(image_input, bytes):
        nparr = np.frombuffer(image_input, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image from provided bytes.")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        return gray, img

    if isinstance(image_input, np.ndarray):
        if len(image_input.shape) == 2:
            gray = image_input
            img = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
            return gray, img
        elif len(image_input.shape) == 3:
            img = image_input
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            return gray, img

    raise TypeError(f"Unsupported image_input type: {type(image_input)}")


def calc_grayscale_histogram(gray, bins=256):
    """
    Calculates grayscale histogram using cv2.calcHist.
    Matches Section 3: cv2.calcHist([gray], [0], None, [bins], [0, 256])
    Returns:
      - histogram: list of float counts
      - shape: tuple (bins, 1)
      - total_pixels: int
      - zero_pixel_count: int
    """
    hist = cv2.calcHist([gray], [0], None, [bins], [0, 256])
    return {
        "bins": bins,
        "histogram": [float(val[0]) for val in hist],
        "shape": list(hist.shape),
        "total_pixels": int(hist.sum()),
        "zero_pixel_count": int(hist[0][0])
    }


def calc_manual_histogram(gray):
    """
    Manual histogram calculation using numpy zero-bucket array.
    Matches Section 3 Step 3:
      hist_manual = np.zeros(256, dtype=int)
      for row in gray:
          for pixel in row:
              hist_manual[pixel] += 1
    """
    hist_manual = np.zeros(256, dtype=int)
    for row in gray:
        for pixel in row:
            hist_manual[pixel] += 1
    return {
        "bins": 256,
        "histogram": [int(x) for x in hist_manual],
        "shape": [256],
        "total_pixels": int(hist_manual.sum())
    }


def calc_color_histogram(img, bins=256):
    """
    Calculates BGR color histograms for each channel independently.
    Matches Section 3 Step 5:
      for i, col in enumerate(('b', 'g', 'r')):
          h = cv2.calcHist([img], [i], None, [256], [0, 256])
    """
    channels = {}
    channel_names = ('b', 'g', 'r')
    for i, col in enumerate(channel_names):
        h = cv2.calcHist([img], [i], None, [bins], [0, 256])
        channels[col] = [float(val[0]) for val in h]

    return {
        "bins": bins,
        "blue": channels['b'],
        "green": channels['g'],
        "red": channels['r'],
        "shape": [bins, 1]
    }


def calc_masked_histogram(gray, mask_type="square", custom_mask=None, bins=256):
    """
    Calculates histogram of a masked region.
    Matches Section 3 Step 6 & Task 3:
      mask_type="square": mask[50:150, 50:150] = 255
      mask_type="top_half": mask[:gray.shape[0] // 2, :] = 255
    """
    h, w = gray.shape
    if custom_mask is not None:
        mask = custom_mask
    else:
        mask = np.zeros(gray.shape, np.uint8)
        if mask_type == "square":
            y_start = min(50, h // 4)
            y_end = min(150, max(y_start + 10, h * 3 // 4))
            x_start = min(50, w // 4)
            x_end = min(150, max(x_start + 10, w * 3 // 4))
            mask[y_start:y_end, x_start:x_end] = 255
        elif mask_type == "top_half":
            mask[:h // 2, :] = 255
        else:
            mask[:] = 255

    hist_masked = cv2.calcHist([gray], [0], mask, [bins], [0, 256])
    active_mask_pixels = int(np.count_nonzero(mask == 255))
    hist_sum = int(hist_masked.sum())

    return {
        "mask_type": mask_type,
        "bins": bins,
        "histogram": [float(val[0]) for val in hist_masked],
        "shape": list(hist_masked.shape),
        "active_mask_pixels": active_mask_pixels,
        "total_pixels_in_hist": hist_sum,
        "mask_bounds": {
            "height": h,
            "width": w
        }
    }


def execute_student_tasks(gray):
    """
    Runs automated verification of the 3 Student Practice Tasks from section-03.py:
      - Task 1: 16-bin histogram (cv2.calcHist with 16 bins)
      - Task 2: Verify total count equals total pixels (H * W)
      - Task 3: Histogram of top half with a mask
    """
    h, w = gray.shape
    total_pixels = h * w

    # Task 1: 16-bin histogram
    hist16 = cv2.calcHist([gray], [0], None, [16], [0, 256])
    task1_valid = (hist16.shape == (16, 1))

    # Task 2: Verify total count equals total pixels (H * W)
    hist_all = cv2.calcHist([gray], [0], None, [256], [0, 256])
    hist_sum = int(hist_all.sum())
    task2_valid = (hist_sum == total_pixels)

    # Task 3: Histogram of top half with a mask
    mask_top = np.zeros(gray.shape, np.uint8)
    mask_top[:h // 2, :] = 255
    top_hist = cv2.calcHist([gray], [0], mask_top, [256], [0, 256])
    top_pixels = int(top_hist.sum())
    expected_top_pixels = (h // 2) * w
    task3_valid = (top_pixels == expected_top_pixels)

    return {
        "task1": {
            "title": "Task 1: 16-Bin Histogram",
            "bins": 16,
            "shape": list(hist16.shape),
            "expected_shape": [16, 1],
            "passed": bool(task1_valid),
            "histogram": [float(val[0]) for val in hist16]
        },
        "task2": {
            "title": "Task 2: Total Pixel Verification (hist.sum() vs H*W)",
            "hist_sum": hist_sum,
            "total_pixels": total_pixels,
            "h": h,
            "w": w,
            "passed": bool(task2_valid)
        },
        "task3": {
            "title": "Task 3: Top Half Mask Histogram",
            "top_pixels": top_pixels,
            "expected_top_pixels": expected_top_pixels,
            "passed": bool(task3_valid),
            "histogram": [float(val[0]) for val in top_hist]
        }
    }
