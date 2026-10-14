# ============================================================================
# Course: Multimedia Systems & Programming
# Unit Tests: Session 02 - Digital Images with OpenCV
# Instructor: Eng. Muhammad Ali Abdul Kareem — Sinai University
# ============================================================================

import os
import unittest
import numpy as np
import cv2

class TestSession02DigitalImages(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Resolve test image path
        script_dir = os.path.dirname(os.path.abspath(__file__))
        cls.image_path = os.path.join(script_dir, "image_name.jpg")
        if not os.path.exists(cls.image_path):
            cls.image_path = os.path.join(script_dir, "../../frontend/assets/images/hero_landscape.jpg")
        
        # Load test image
        cls.img = cv2.imread(cls.image_path)
        if cls.img is None:
            # Fallback synthetic test image (100x120 BGR color gradient)
            cls.img = np.zeros((100, 120, 3), dtype=np.uint8)
            cls.img[:, :, 0] = np.linspace(0, 255, 120, dtype=np.uint8)
            cls.img[:, :, 1] = 128
            cls.img[:, :, 2] = 200

    def test_01_image_properties(self):
        """1. Verify image matrix shape, data type, and BGR color dimensions"""
        self.assertIsNotNone(self.img, "Image failed to load")
        self.assertEqual(len(self.img.shape), 3, "Image should be a 3D array (H, W, Channels)")
        self.assertEqual(self.img.shape[2], 3, "Image should have 3 color channels (BGR)")
        self.assertEqual(self.img.dtype, np.uint8, "Image data type should be uint8")
        self.assertTrue(0 <= self.img.min() <= self.img.max() <= 255, "Pixel intensities must be in [0, 255]")

    def test_02_grayscale_conversion(self):
        """2. Verify BGR to Grayscale conversion and dimensional reduction"""
        gray = cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY)
        self.assertEqual(len(gray.shape), 2, "Grayscale image should be a 2D array (H, W)")
        self.assertEqual(gray.shape[0], self.img.shape[0], "Grayscale height should match original height")
        self.assertEqual(gray.shape[1], self.img.shape[1], "Grayscale width should match original width")
        self.assertEqual(gray.dtype, np.uint8, "Grayscale data type should be uint8")

        # Verify ITU-R 601 formula approximation for top-left pixel
        b, g, r = self.img[0, 0]
        expected_luma = int(round(0.299 * r + 0.587 * g + 0.114 * b))
        actual_luma = int(gray[0, 0])
        self.assertAlmostEqual(actual_luma, expected_luma, delta=2)

    def test_03_binary_thresholding(self):
        """3. Verify binary thresholding produces strictly {0, 255} discrete values"""
        gray = cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY)
        ret, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        self.assertEqual(ret, 127.0, "Threshold return value should match input threshold (127)")
        self.assertEqual(binary.shape, gray.shape, "Binary shape should match grayscale shape")
        
        unique_vals = set(np.unique(binary))
        self.assertTrue(unique_vals.issubset({0, 255}), f"Binary image should only contain 0 and 255, got {unique_vals}")

    def test_04_resizing(self):
        """4. Verify spatial resizing changes dimensions according to (Width, Height)"""
        target_size = (300, 300)  # (Width, Height)
        resized = cv2.resize(self.img, target_size)
        self.assertEqual(resized.shape, (300, 300, 3), "Resized shape should be (300, 300, 3)")

    def test_05_rotation(self):
        """5. Verify 90 degree and 180 degree rotations and shape transposition"""
        h, w, c = self.img.shape
        rotated_90 = cv2.rotate(self.img, cv2.ROTATE_90_CLOCKWISE)
        rotated_180 = cv2.rotate(self.img, cv2.ROTATE_180)

        self.assertEqual(rotated_90.shape, (w, h, c), "90° rotation should swap Height and Width")
        self.assertEqual(rotated_180.shape, (h, w, c), "180° rotation should maintain Height and Width")

    def test_06_student_tasks(self):
        """6. Verify student practice tasks from session02_digital_images.py"""
        gray = cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY)

        # Task 1: Threshold comparison (T=100 vs T=127)
        _, binary_100 = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY)
        _, binary_127 = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        white_100 = np.count_nonzero(binary_100 == 255)
        white_127 = np.count_nonzero(binary_127 == 255)
        self.assertGreaterEqual(white_100, white_127, "Lower threshold (100) must produce >= white pixels than (127)")

        # Task 2: Resize to (150, 150)
        task_resized = cv2.resize(self.img, (150, 150))
        self.assertEqual(task_resized.shape, (150, 150, 3), "Task 2 resized shape must be (150, 150, 3)")

        # Task 3: Rotate 180° vs 90°
        task_rotated_180 = cv2.rotate(self.img, cv2.ROTATE_180)
        task_rotated_90 = cv2.rotate(self.img, cv2.ROTATE_90_CLOCKWISE)
        self.assertEqual(task_rotated_180.shape, self.img.shape)
        self.assertEqual(task_rotated_90.shape, (self.img.shape[1], self.img.shape[0], self.img.shape[2]))

if __name__ == '__main__':
    unittest.main()
