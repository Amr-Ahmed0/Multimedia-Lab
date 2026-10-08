# 🐍 Multimedia Lab - Backend (FastAPI Integration Guide)

This directory will house the **Python FastAPI** backend REST API for server-side image processing.

---

## 📌 Architecture Overview

When the backend is implemented, the data flow will operate as follows:

```text
┌─────────────────┐        POST /api/process        ┌──────────────────┐
│                 │ ──────────────────────────────> │                  │
│  Frontend (JS)  │                                 │  FastAPI Server  │
│                 │ <────────────────────────────── │                  │
└─────────────────┘      JSON / Processed Image     └─────────┬────────┘
                                                              │
                                                              ▼
                                                   ┌──────────────────┐
                                                   │ Processing Core  │
                                                   │ (OpenCV / Pillow)│
                                                   └──────────────────┘
```

---

## ⚙️ Planned Backend Features

- **Framework**: FastAPI + Uvicorn
- **API Endpoints**:
  - `POST /api/upload`: Store raw upload image in `uploads/`.
  - `POST /api/process/{operation}`: Execute image processing task with dynamic parameters.
  - `GET /api/outputs/{filename}`: Serve processed result image from `outputs/`.
- **CORS Support**: `fastapi.middleware.cors.CORSMiddleware` to allow local cross-origin requests from frontend.

---

## 🔗 Connecting Frontend to FastAPI

In `frontend/js/operations.js`, replace the `processImage` function body with a backend fetch request:

```javascript
async function processImage(file, operation, options) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("operation", operation);
    formData.append("options", JSON.stringify(options));

    const response = await fetch("http://localhost:8000/api/process", {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        throw new Error("Failed to process image on server");
    }

    const data = await response.json();
    return data.resultImageUrl; // e.g. "http://localhost:8000/outputs/processed_123.png"
}
```

---

## 🛠️ Required Python Packages (Future Setup)

```bash
pip install fastapi uvicorn python-multipart opencv-python pillow numpy
```
