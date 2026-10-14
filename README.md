# 🎬 Multimedia Lab — Signal, Audio & Image Processing Suite

> A university educational platform and interactive workspace for learning, implementing, and visualizing Multimedia, Digital Signal Processing, and Computer Vision algorithms.

**Multimedia Lab** bridges theoretical multimedia computing with practical implementations. It features a dual-layer architecture:
1. **Python Scientific Processing Modules (`processing/`)**: Pure Python algorithms with automated unit tests utilizing **NumPy**, **SciPy**, **OpenCV**, and **Matplotlib**.
2. **Interactive Web Application (`frontend/`)**: A modern dark-themed web platform with real-time **HTML5 Canvas 2D** visualizations, pixel inspection, and **Web Audio API** synthesis.

---

## 🏛️ Academic Course Context

- **Institution:** Sinai University — Faculty of Information Technology / Computer Science
- **Course:** Multimedia Systems & Programming
- **Instructor / Supervisor:** Eng. Muhammad Ali Abdul Kareem

---

## 📚 Curriculum Sessions Status

| Session | Topic | Key Concepts | Status | Components |
|---|---|---|---|---|
| **Session 01** | **Digital Sound** | Sine waves, Gain control, Nyquist-Shannon sampling ($F_s \ge 2 f_{\max}$), ADC Quantization (Bit Depth), DAC Reconstruction | **Completed** | `session_01_digital_sound.py`, `README.md`, `audio.js` (Web Audio API) |
| **Session 02** | **Digital Images with OpenCV** | NumPy 3D matrix `(H, W, 3)`, BGR/RGB channels, Grayscale conversion (ITU-R 601), Binary Thresholding, Spatial Resizing, Orthogonal Rotation, Matplotlib (`cmap='gray'`, Viridis) | **Completed** | `session02_digital_images.py`, `test_session02.py`, `README.md`, `section02.js` |
| **Session 03** | **Color Models & Transformations** | RGB, HSV, CMYK, HSL color spaces and color plane extraction | *Roadmap* | Placeholder UI integrated with bidirectional routing |
| **Session 04** | **Spatial Filtering & Convolutions** | Gaussian blur, median filters, sharpening kernels, box blur | *Roadmap* | General Image Processing Workspace available |
| **Session 05** | **Edge Detection & Gradients** | Sobel, Prewitt, Laplacian, Canny edge detection | *Roadmap* | General Image Processing Workspace available |
| **Session 06** | **Frequency Domain & Fourier Analysis** | 2D DFT, FFT, High-pass/Low-pass frequency filtering | *Roadmap* | Curriculum placeholder |
| **Session 07** | **Image Segmentation & Morphology** | Dilation, erosion, opening, closing, contour detection | *Roadmap* | Curriculum placeholder |
| **Session 08** | **Multimedia Compression** | Lossless (Huffman, RLE) and Lossy (DCT, JPEG, MP3) | *Roadmap* | Curriculum placeholder |

---

## 🚀 Key Features

### 🔊 1. Digital Sound Studio (Session 01)
- **Continuous Waveform Synthesis**: Live generation of pure sinusoidal tones $y(t) = A \sin(2\pi f t)$.
- **Audible Web Audio Playback**: Listen to frequency shifts, volume gain attenuation, and digital clipping in real time.
- **Nyquist-Shannon Sampling Visualizer**: Observe sample points ($t_s$) and aliasing foldback when $F_s < 2 f_{\max}$.
- **Quantization Simulator**: Step through 1-bit, 3-bit, 8-bit, and 16-bit depth levels and observe quantization noise.
- **Student Task Verifiers**: One-click verifiers checking practice tasks with instant visual feedback badges.

### 🖼️ 2. Digital Images with OpenCV Studio (Session 02)
- **NumPy Matrix & Pixel Coordinate Inspector**: Click anywhere on the canvas or type $(X, Y)$ coordinates to inspect raw OpenCV `[B, G, R]` values, converted `[R, G, B]` values, data type `uint8`, 3D shape `(H, W, C)`, and a live color swatch.
- **Channel Isolation**: View full color, or filter isolated Red, Green, or Blue channels.
- **Luminance Grayscale Conversion**: Implements $Y = 0.299R + 0.587G + 0.114B$ with standard view and an interactive split-screen comparison slider.
- **Binary Thresholding Simulator**: Interactive threshold slider ($T \in [0, 255]$), preset buttons (64, 100, 127, 180), and real-time white vs. black pixel percentage calculation.
- **Spatial Resizing & Aspect Ratio Lock**: Modify target width and height with optional aspect-ratio constraint and instant shape metrics.
- **Orthogonal Rotation**: Cycle through 0°, 90° CW, 180°, and 270° CCW with automatic dimension transposition tracking.
- **Matplotlib Scientific Plot Emulation**: Simulate `plt.imshow` with authentic 256-step Viridis colormap LUT, `cmap='gray'`, raw BGR inverted tint demonstration, and `plt.axis('on'/'off')` axis ticks.
- **Student Practice Task Verifier**: Automated interactive verification for Tasks 1, 2, 3, and 4 matching `session02_digital_images.py`.

### 🎨 3. Image Processing Workspace
- Drag-and-drop file uploader with client-side image validation.
- Original vs. processed side-by-side preview with zoom and metadata inspector.
- Filter operations (Grayscale, Invert, Sepia, Blur, Brightness, Contrast, Threshold).
- High-resolution processed image export and download.

---

## 🛠️ Technology Stack

| Layer | Technologies | Responsibilities |
|---|---|---|
| **Frontend Core** | HTML5 Semantic Elements | Application layout, accessible cards, and modal dialogs |
| **Styling & Theme** | Vanilla CSS3 + Modern Custom Properties | Dark SaaS design system (`#0D1117`, `#161B22`, `#1F242C`, `#6EE7B7`), responsive grid |
| **Interactive Logic** | Vanilla JavaScript (ES6+) | Workspace routing, HTML5 Canvas 2D rendering, Web Audio API synthesis |
| **Python Processing** | Python 3.10+, OpenCV, NumPy, SciPy, Matplotlib | Scientific algorithms, matrix operations, signal processing, and CLI execution |
| **Testing** | Python `unittest` | Automated validation of curriculum assignments |
| **Version Control** | Git & GitHub | Modular branching workflow (`session01`, `session02`, feature branches) |

---

## 📂 Repository Structure

```text
Multimedia-Lab/
├── frontend/                          # Client-side web application (zero framework dependencies)
│   ├── index.html                     # Main application entry point & workspaces
│   ├── css/
│   │   ├── style.css                  # Core design system, UI components, section styles
│   │   └── responsive.css             # Responsive media queries (desktop, tablet, mobile)
│   ├── js/
│   │   ├── app.js                     # Main state manager, routing & workspace activator
│   │   ├── audio.js                   # Session 01: Digital Sound Web Audio & Canvas visualizer
│   │   ├── section02.js               # Session 02: Digital Images OpenCV simulator & verifiers
│   │   ├── upload.js                  # Drag-and-drop upload handler & validation
│   │   ├── preview.js                 # Original/result previews & metadata panel
│   │   ├── operations.js              # Image processing transformations & filters
│   │   └── download.js                # Processed image export & downloading
│   └── assets/
│       └── images/                    # Demo images and curriculum sample assets
│           └── hero_landscape.jpg
├── processing/                        # Python curriculum modules & algorithms
│   ├── README.md                      # Overview of Python processing operations & formulas
│   ├── section-01/                    # Session 01: Digital Sound
│   │   ├── session_01_digital_sound.py # Reference Python script (NumPy, SciPy, Matplotlib)
│   │   └── README.md                  # Detailed documentation & mathematical formulas
│   └── section-02/                    # Session 02: Digital Images with OpenCV
│       ├── session02_digital_images.py # Reference Python script (OpenCV, NumPy, Matplotlib)
│       ├── test_session02.py          # Automated Python unit test suite (6 tests)
│       ├── image_name.jpg             # Sample curriculum image
│       └── README.md                  # Detailed documentation, formulas & CLI outputs
├── uploads/                           # Temporary user upload directory (git-ignored)
├── outputs/                           # Generated processing outputs (git-ignored)
├── README.md                          # Main project documentation
└── .gitignore                         # Git exclusion rules
```

---

## ⚡ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/multimedia-lab.git
cd multimedia-lab
```

### 2. Set Up the Python Environment

Create an isolated virtual environment and install the required scientific libraries:

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install opencv-python numpy matplotlib scipy
```

---

## 🧪 Running Tests & Scripts

### Run Session 01 (Digital Sound)
```bash
python processing/section-01/session_01_digital_sound.py
```
*Outputs amplitude measurements, sampling rate checks ($F_s$ vs. $2f$), and quantization bit depth levels.*

### Run Session 02 Automated Unit Tests (Digital Images)
```bash
python -m unittest processing/section-02/test_session02.py
```
*Expected output:*
```text
......
----------------------------------------------------------------------
Ran 6 tests in 0.204s

OK
```

### Run Session 02 Curriculum Script
```bash
python processing/section-02/session02_digital_images.py
```
*(On headless environments or terminals, run with `MPLBACKEND=Agg` to prevent GUI blocking).*

---

## 🌐 Running the Interactive Web Application

Launch a local HTTP server from the project root:

```bash
python -m http.server 8000 --directory frontend
```

Open your browser at:
```text
http://localhost:8000
```

### Navigating Workspaces:
1. **Home (`/`)**: Overview hero banner with an interactive split-image comparison slider and quick feature navigation cards.
2. **Session 01 (`Digital Sound`)**: Waveform synthesis, gain control, Nyquist-Shannon aliasing visualizer, and Web Audio playback.
3. **Session 02 (`Digital Images`)**: Interactive OpenCV matrix inspection, grayscale split compare, binary threshold slider, spatial resizing, 90°/180° rotation, Matplotlib simulation, and practice task verifiers.
4. **Image Processing**: Upload custom images, apply filters, and download results.

---

## 👥 Git & GitHub Collaboration Workflow

To ensure smooth collaboration among team members:

1. **Keep `main` stable**: Never push directly to `main`.
2. **Create feature branches**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/section-XX
   ```
3. **Isolate changes**: Keep changes within your assigned session folder (`processing/section-XX/`) and coordinate frontend additions.
4. **Write unit tests**: Ensure automated tests pass before submitting pull requests.
5. **Open Pull Requests**: Provide clear descriptions, testing commands, and screenshots of verified outputs.

---

## 📝 Definition of Done for Course Sections

A session is considered complete when:
- [x] The Python reference script implements all curriculum algorithms.
- [x] Automated unit tests validate normal and edge-case behaviors.
- [x] The section README thoroughly documents mathematical models, parameters, and outputs.
- [x] Interactive web simulation components and responsive canvas visualizations are implemented.
- [x] Student practice task verifiers are active in both the script and web GUI.
- [x] Code passes peer review and is cleanly merged.

---

**Multimedia Lab** — Sinai University • Faculty of Information Technology
