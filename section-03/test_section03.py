# ============================================================================
# Course: Multimedia Systems & Programming
# Unit Tests: Session 03 (Curriculum Session 05) - Image Histogram with Python & OpenCV
# Instructor: Eng. Muhammad Ali Abdul Kareem — Sinai University
# ============================================================================

import os
import unittest
import numpy as np
import cv2

try:
    from section03_engine import (
        load_image,
        calc_grayscale_histogram,
        calc_manual_histogram,
        calc_color_histogram,
        calc_masked_histogram,
        execute_student_tasks
    )
except ImportError:
    from .section03_engine import (
        load_image,
        calc_grayscale_histogram,
        calc_manual_histogram,
        calc_color_histogram,
        calc_masked_histogram,
        execute_student_tasks
    )


class TestSection03ImageHistogram(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Load sample or synthetic test image
        cls.gray, cls.img = load_image()

    def test_01_image_dimensions_and_ravel(self):
        """1. Verify grayscale and flattened 1D array shapes (gray.shape & flat.shape)"""
        self.assertIsNotNone(self.gray, "Grayscale image failed to load")
        self.assertIsNotNone(self.img, "Color image failed to load")
        self.assertEqual(len(self.gray.shape), 2, "Grayscale image must be 2D matrix (H, W)")
        self.assertEqual(len(self.img.shape), 3, "Color image must be 3D matrix (H, W, 3)")
        
        flat = self.gray.ravel()
        expected_len = self.gray.shape[0] * self.gray.shape[1]
        self.assertEqual(flat.shape[0], expected_len, "Flattened array length must equal H * W")

    def test_02_manual_vs_opencv_calcHist(self):
        """2. Verify manual counting with np.zeros matches cv2.calcHist exactly"""
        manual_res = calc_manual_histogram(self.gray)
        opencv_res = calc_grayscale_histogram(self.gray, bins=256)

        # Both methods must yield exact same bin counts for all 256 intensities
        self.assertEqual(len(manual_res["histogram"]), 256)
        self.assertEqual(len(opencv_res["histogram"]), 256)
        for i in range(256):
            self.assertEqual(
                manual_res["histogram"][i],
                int(opencv_res["histogram"][i]),
                f"Mismatch at intensity level {i}"
            )
        self.assertEqual(manual_res["total_pixels"], opencv_res["total_pixels"])

    def test_03_color_histogram_bgr_channels(self):
        """3. Verify BGR 3-channel color histogram extraction"""
        color_res = calc_color_histogram(self.img, bins=256)
        self.assertIn("blue", color_res)
        self.assertIn("green", color_res)
        self.assertIn("red", color_res)
        self.assertEqual(len(color_res["blue"]), 256)
        self.assertEqual(len(color_res["green"]), 256)
        self.assertEqual(len(color_res["red"]), 256)

        # Total pixels in each channel must equal H * W
        expected_total = self.img.shape[0] * self.img.shape[1]
        self.assertEqual(int(sum(color_res["blue"])), expected_total)
        self.assertEqual(int(sum(color_res["green"])), expected_total)
        self.assertEqual(int(sum(color_res["red"])), expected_total)

    def test_04_histogram_masking(self):
        """4. Verify histogram masking strictly counts pixels within active mask ROI"""
        mask_res = calc_masked_histogram(self.gray, mask_type="square")
        self.assertEqual(mask_res["total_pixels_in_hist"], mask_res["active_mask_pixels"])
        self.assertGreater(mask_res["active_mask_pixels"], 0)

    def test_05_student_tasks_verification(self):
        """5. Verify Student Practice Tasks 1, 2, and 3 matching section-03.py"""
        tasks_res = execute_student_tasks(self.gray)

        # Task 1: 16-bin histogram
        self.assertTrue(tasks_res["task1"]["passed"])
        self.assertEqual(tasks_res["task1"]["shape"], [16, 1])

        # Task 2: hist.sum() == H * W
        self.assertTrue(tasks_res["task2"]["passed"])
        self.assertEqual(tasks_res["task2"]["hist_sum"], tasks_res["task2"]["total_pixels"])

        # Task 3: Top half masked histogram
        self.assertTrue(tasks_res["task3"]["passed"])
        self.assertEqual(tasks_res["task3"]["top_pixels"], tasks_res["task3"]["expected_top_pixels"])


if __name__ == '__main__':
    unittest.main()
