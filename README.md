<<<<<<< HEAD
# 🎬 Multimedia Lab

**Multimedia Lab** is a clean, modern, dark-themed SaaS web platform designed for Computer Science students studying Multimedia systems and Image Processing.

It provides an intuitive workflow for uploading images, inspecting metadata, configuring processing operations with dynamic parameters, visualizing real-time results, and downloading output images.

---

## 📁 Project Structure

```text
multimedia-lab/
│
├── frontend/
│   ├── index.html          # Main application UI layout & structure
│   ├── css/
│   │   ├── style.css       # Core design system, variables & dashboard styles
│   │   └── responsive.css  # Media queries & mobile responsiveness
│   ├── js/
│   │   ├── app.js          # App initialization, global state & module orchestration
│   │   ├── upload.js       # Drag & Drop handling, file selection & validation
│   │   ├── preview.js      # Image metadata extraction & preview rendering
│   │   ├── operations.js   # Dynamic controls, state & mock/FastAPI processing handler
│   │   └── download.js     # Client-side image download utility
│   └── assets/
│       ├── images/         # Static visual assets & logos
│       └── icons/          # System SVG icons
│
├── backend/                # Python FastAPI Backend (Future Integration)
│   └── README.md
│
├── processing/             # OpenCV / Pillow / NumPy Algorithms (Future Integration)
│   └── README.md
│
├── uploads/                # Directory for user uploaded raw images
│   └── .gitkeep
│
├── outputs/                # Directory for backend processed result images
│   └── .gitkeep
│
├── README.md               # Main project documentation
└── .gitignore              # Git ignore configuration
```

---

## 🎨 UI & Technology Stack

- **HTML5**: Semantic, accessible markup.
- **CSS3**: Pure Vanilla CSS, Modern Dark SaaS design palette (`#0D1117`, `#161B22`, `#1F242C`, `#30363D`, `#5DD65D`).
- **Vanilla JavaScript**: Modular architecture ES6+, state management object, native Canvas API for local mock previews, no external frameworks (No React, Vue, Angular, Bootstrap, Tailwind, or jQuery).
- **Icons**: Scalable inline SVG icons.

---

## 🚀 Quick Start (Frontend Only)

1. Open `frontend/index.html` directly in any modern Web Browser (Google Chrome, Firefox, Edge, Safari).
2. Alternatively, serve using a simple HTTP server:
   ```bash
   # Using Python built-in server
   python -m http.server 8000 --directory frontend
   ```
3. Drag & drop or select an image (PNG, JPG, JPEG, WEBP).
4. Choose an image operation from the Operations panel (Grayscale, Resize, Rotate, Flip, Blur, Brightness, Contrast, Edge Detection).
5. Adjust dynamic parameter controls and click **Apply Operation**.
6. View the result and click **Download Image**.

---

## 🔮 Future Python Backend Integration Roadmap

This frontend has been engineered from the ground up to support seamless connection to a **FastAPI** Python backend utilizing **OpenCV**, **Pillow (PIL)**, and **NumPy**. 

See [`backend/README.md`](file:///d:/GitHub/Multimedia%20Lab/backend/README.md) and [`processing/README.md`](file:///d:/GitHub/Multimedia%20Lab/processing/README.md) for step-by-step setup guides.
=======
# Multimedia-Lab
>>>>>>> 1688bf76950b889fa76565af07d797c629523e13
