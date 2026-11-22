# ============================================================================
# Course: Multimedia Systems & Programming
# Backend: Section 03 - Image Histogram FastAPI Router
# Instructor: Eng. Muhammad Ali Abdul Kareem — Sinai University
# ============================================================================

import os
import io
import base64
import sys
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse

# Add section-03 directory to python path for importing engine
SECTION03_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "section-03"))
if SECTION03_DIR not in sys.path:
    sys.path.insert(0, SECTION03_DIR)

import matplotlib
matplotlib.use("Agg")  # Headless backend
import matplotlib.pyplot as plt
import numpy as np
import cv2

from section03_engine import (
    load_image,
    calc_grayscale_histogram,
    calc_manual_histogram,
    calc_color_histogram,
    calc_masked_histogram,
    execute_student_tasks
)

router = APIRouter(prefix="/api/section03", tags=["Section 03 - Image Histogram"])


def _render_plot_to_base64():
    """Converts the current matplotlib figure to a PNG base64 string and closes the figure."""
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight", dpi=100, facecolor="#161B22", edgecolor="none")
    plt.close()
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


@router.post("/histogram")
async def get_histogram(
    file: Optional[UploadFile] = File(None),
    hist_type: str = Form("grayscale"),  # "grayscale", "color", "manual"
    bins: int = Form(256)
):
    """
    Computes image histogram according to Section 3 specifications.
    Supports grayscale cv2.calcHist, manual np.zeros counting, and BGR color histograms.
    """
    try:
        image_bytes = await file.read() if file else None
        gray, img = load_image(image_bytes)
        h, w = gray.shape

        result = {
            "success": True,
            "image_properties": {
                "height": h,
                "width": w,
                "total_pixels": h * w,
                "channels": 3 if len(img.shape) == 3 else 1
            },
            "hist_type": hist_type,
            "bins": bins
        }

        if hist_type == "manual":
            hist_data = calc_manual_histogram(gray)
            result["data"] = hist_data

            # Generate Matplotlib plot matching Section 3 Step 3
            plt.figure(figsize=(6, 3))
            plt.style.use("dark_background")
            plt.plot(hist_data["histogram"], color="#A855F7", lw=1.5)
            plt.title("Manual Counting Histogram (np.zeros)", color="#E2E8F0")
            plt.xlabel("Pixel intensity (0-255)", color="#94A3B8")
            plt.ylabel("Number of pixels", color="#94A3B8")
            plt.xlim([0, 256])
            plt.grid(True, alpha=0.15)
            result["plot_image"] = _render_plot_to_base64()

        elif hist_type == "color":
            hist_data = calc_color_histogram(img, bins=bins)
            result["data"] = hist_data

            # Generate Matplotlib plot matching Section 3 Step 5
            plt.figure(figsize=(6, 3))
            plt.style.use("dark_background")
            plt.plot(hist_data["blue"], color="#38BDF8", label="Blue Channel", lw=1.5)
            plt.plot(hist_data["green"], color="#4ADE80", label="Green Channel", lw=1.5)
            plt.plot(hist_data["red"], color="#F87171", label="Red Channel", lw=1.5)
            plt.title("Color Histogram (cv2.calcHist BGR)", color="#E2E8F0")
            plt.xlabel("Pixel intensity", color="#94A3B8")
            plt.ylabel("Number of pixels", color="#94A3B8")
            plt.xlim([0, bins])
            plt.legend()
            plt.grid(True, alpha=0.15)
            result["plot_image"] = _render_plot_to_base64()

        else:  # grayscale cv2.calcHist / plt.hist
            hist_data = calc_grayscale_histogram(gray, bins=bins)
            result["data"] = hist_data

            # Generate Matplotlib plot matching Section 3 Step 2 & 4
            plt.figure(figsize=(6, 3))
            plt.style.use("dark_background")
            plt.plot(hist_data["histogram"], color="#6EE7B7", lw=1.5)
            plt.title(f"Grayscale Histogram (calcHist {bins} bins)", color="#E2E8F0")
            plt.xlabel("Pixel intensity (0-255)", color="#94A3B8")
            plt.ylabel("Number of pixels", color="#94A3B8")
            plt.xlim([0, bins])
            plt.grid(True, alpha=0.15)
            result["plot_image"] = _render_plot_to_base64()

        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mask")
async def get_masked_histogram(
    file: Optional[UploadFile] = File(None),
    mask_type: str = Form("square"),  # "square" (50:150) or "top_half"
    bins: int = Form(256)
):
    """
    Computes histogram of masked image region matching Section 3 Step 6 & Task 3.
    """
    try:
        image_bytes = await file.read() if file else None
        gray, img = load_image(image_bytes)

        mask_data = calc_masked_histogram(gray, mask_type=mask_type, bins=bins)

        # Generate Matplotlib plot matching Section 3 Step 6
        plt.figure(figsize=(6, 3))
        plt.style.use("dark_background")
        plt.plot(mask_data["histogram"], color="#FBBF24", lw=1.5)
        title = "Masked Region Histogram (50:150 ROI)" if mask_type == "square" else "Top Half Mask Histogram"
        plt.title(title, color="#E2E8F0")
        plt.xlabel("Pixel intensity", color="#94A3B8")
        plt.ylabel("Number of pixels", color="#94A3B8")
        plt.xlim([0, bins])
        plt.grid(True, alpha=0.15)
        plot_image = _render_plot_to_base64()

        return JSONResponse(content={
            "success": True,
            "data": mask_data,
            "plot_image": plot_image
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-tasks")
async def verify_tasks(
    file: Optional[UploadFile] = File(None)
):
    """
    Runs automated validation for all 3 Student Practice Tasks from section-03.py.
    """
    try:
        image_bytes = await file.read() if file else None
        gray, _ = load_image(image_bytes)

        tasks_result = execute_student_tasks(gray)
        return JSONResponse(content={
            "success": True,
            "tasks": tasks_result
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
