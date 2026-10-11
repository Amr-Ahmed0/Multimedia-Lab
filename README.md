# 🎬 Multimedia Lab

> A collaborative university project for learning and implementing Multimedia and Image Processing techniques through one web application.

**Multimedia Lab** is a modern, dark-themed web application for Computer Science students. Users upload an image, preview it, choose a processing operation, configure parameters, inspect the result, and download the processed image.

This README combines both project documentation and the team workflow:
- **For new visitors:** what the project does, its architecture, technologies, and repository structure.
- **For team members:** what to do first, how to implement an assigned course section, and how to contribute through GitHub.

## Table of Contents

- [Project Overview](#project-overview)
- [Features and Technology Stack](#features-and-technology-stack)
- [Application Workflow](#application-workflow)
- [Repository Structure](#repository-structure)
- [Folder Responsibilities](#folder-responsibilities)
- [Getting Started](#getting-started)
- [Development Roadmap](#development-roadmap)
- [Team Responsibilities](#team-responsibilities)
- [Implementing a Course Section](#implementing-a-course-section)
- [Git and GitHub Workflow](#git-and-github-workflow)
- [Pull Request Checklist](#pull-request-checklist)
- [Definition of Done](#definition-of-done)

---

## Project Overview

The project is developed in stages. First, the team establishes a stable shared frontend and repository structure. Then, each of the seven members implements one Multimedia course section in an isolated processing module. Finally, these modules are connected to the backend and tested through the complete application.

**Important:** “Section 01” through “Section 07” are placeholders. Replace them with the actual course topics once the team has agreed on assignments.

## Features and Technology Stack

### Planned features
- Image upload using file selection or drag and drop.
- Image validation and basic metadata display.
- Original and processed image previews.
- Operation selection and configurable parameters.
- Loading, success, error, and empty states.
- Processed image download.
- Responsive desktop, tablet, and mobile layout.

Example operations shown in the interface may include Grayscale, Resize, Rotate, Flip, Blur, Brightness, Contrast, and Edge Detection. These are examples only; the final operations should match the actual course sections.

### Technology stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | HTML5 | Application structure |
| Styling | CSS3 | Theme, layout, responsive design |
| Browser behavior | Vanilla JavaScript (ES6+) | Upload, previews, controls, downloads |
| Backend | Python + FastAPI | API, validation, request coordination |
| Processing | OpenCV, Pillow, NumPy | Image algorithms |
| Collaboration | Git + GitHub | Version control, review, integration |

The frontend uses vanilla HTML, CSS, and JavaScript; it does not require React, Vue, Angular, Bootstrap, Tailwind, or jQuery.

### UI theme

- Background: `#0D1117`
- Secondary background: `#161B22`
- Cards: `#1F242C`
- Borders: `#30363D`
- Accent: `#5DD65D`
- Main text: `#F0F6FC`
- Muted text: `#8B949E`

## Application Workflow

```text
Upload image
    ↓
Frontend validates and previews it
    ↓
User selects an operation and options
    ↓
Frontend sends request to the API
    ↓
FastAPI validates and routes the request
    ↓
Processing service calls the relevant section
    ↓
Python algorithm processes the image
    ↓
Result is returned to the frontend
    ↓
Preview result → Download result
```

### Separation of responsibilities

```text
FRONTEND: What does the user want to do?
    ↓ HTTP request
BACKEND: Which operation should run?
    ↓ function call
PROCESSING: How is the algorithm performed?
    ↓
STORAGE / RESPONSE: Where is the input or result handled?
```

The frontend should request an operation using an agreed identifier. It should not contain Python algorithms. The backend coordinates the request, and the processing module implements the algorithm.

## Repository Structure

This is the recommended target structure. Some files and folders may be added as implementation progresses.

```text
multimedia-lab/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   ├── style.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── app.js
│   │   ├── upload.js
│   │   ├── preview.js
│   │   ├── operations.js
│   │   └── download.js
│   └── assets/
│       ├── images/
│       └── icons/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── routes/
│   │   └── process.py
│   ├── services/
│   │   └── processing_service.py
│   ├── schemas/
│   │   └── process_schema.py
│   └── README.md
├── processing/
│   ├── common/
│   │   ├── image_utils.py
│   │   └── validation.py
│   ├── section-01/README.md
│   ├── section-02/README.md
│   ├── section-03/README.md
│   ├── section-04/README.md
│   ├── section-05/README.md
│   ├── section-06/README.md
│   └── section-07/README.md
├── uploads/
│   └── .gitkeep
├── outputs/
│   └── .gitkeep
├── tests/
│   ├── frontend/
│   ├── backend/
│   └── processing/
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── team-workflow.md
├── README.md
└── .gitignore
```

## Folder Responsibilities

### `frontend/`
The user interface: upload, preview, operation controls, API requests, result display, and downloads. It does not implement the actual Python algorithms.

### `frontend/css/`
- `style.css`: theme, layout, cards, buttons, upload area, previews, and operation panel.
- `responsive.css`: responsive behavior for desktop, laptop, tablet, and mobile.

### `frontend/js/`
- `app.js`: application initialization and shared state.
- `upload.js`: file selection, drag and drop, and client-side validation.
- `preview.js`: original/result previews, metadata, and preview states.
- `operations.js`: operation selection, dynamic controls, and mock/API processing.
- `download.js`: downloading the processed result.

### `backend/`
FastAPI application. Routes receive requests, schemas validate their structure, and services select the relevant processing module. Keep algorithms out of the route handlers.

### `processing/`
The actual algorithms, separated by course section. Shared reusable helpers belong in `processing/common/`. Coordinate changes to shared files with the team.

### `uploads/` and `outputs/`
Reserved for source images and generated results if filesystem storage is used. Do not commit real user images, generated outputs, secrets, or large files unless the team has explicitly agreed that a test fixture is needed.

### `tests/` and `docs/`
Tests are organized by frontend, backend, and processing. Documentation includes architecture, API contracts, and team workflow.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/multimedia-lab.git
cd multimedia-lab
```

Replace the example URL with the actual repository URL.

### 2. Run the frontend

Open `frontend/index.html` in a modern browser, or run a local HTTP server from the repository root:

```bash
python -m http.server 8000 --directory frontend
```

Then open `http://localhost:8000`.

### 3. Try the interface

1. Select or drag an image into the upload area.
2. Inspect the original preview and metadata.
3. Select an available operation.
4. Adjust its controls and apply it.
5. Check the result and test the download button.

During the frontend-only phase, processing may be mocked or performed locally in the browser. Do not assume every operation is already connected to the Python backend.

### 4. Backend setup

The planned backend uses Python and FastAPI. When it is added, document the exact installation and run commands in `backend/README.md`. Put shared dependencies such as FastAPI, OpenCV, Pillow, and NumPy in the agreed dependency file (for example, `requirements.txt`) rather than relying on undocumented local installations.

## Development Roadmap

### Phase 0 — Planning
- Confirm the repository and folder structure.
- Agree on branch naming and coding conventions.
- Assign the seven actual course sections.
- Agree on operation identifiers and the API request/response contract.

### Phase 1 — Shared frontend
Build and test the sidebar/header, upload UI, original preview, result area, operation panel, mock processing, download behavior, responsive layout, and basic error states.

**Milestone:** the frontend works without Python.

### Phase 2 — Backend foundation
- Set up FastAPI.
- Define an endpoint such as `POST /api/process`.
- Define request/response schemas.
- Add validation and a processing service.
- Connect the frontend to the API.

**Milestone:** the frontend can send a request using the agreed API contract.

### Phase 3 — Course section implementation
Implement one section at a time, test it independently, document it, integrate it with the backend and frontend, then submit a pull request.

### Phase 4 — Integration and testing
Test every section through the same application, including invalid files, invalid parameters, large images, errors, result previews, and downloads.

## Team Responsibilities

There are seven team members, each responsible for one course section. Fill in the real member names and topics before implementation starts.

| Member | Assigned section | Suggested branch | Main folder | Initial status |
|---|---|---|---|---|
| Member 1 | Section 01 — replace with actual topic | `feature/section-01` | `processing/section-01/` | Not started |
| Member 2 | Section 02 — replace with actual topic | `feature/section-02` | `processing/section-02/` | Not started |
| Member 3 | Section 03 — replace with actual topic | `feature/section-03` | `processing/section-03/` | Not started |
| Member 4 | Section 04 — replace with actual topic | `feature/section-04` | `processing/section-04/` | Not started |
| Member 5 | Section 05 — replace with actual topic | `feature/section-05` | `processing/section-05/` | Not started |
| Member 6 | Section 06 — replace with actual topic | `feature/section-06` | `processing/section-06/` | Not started |
| Member 7 | Section 07 — replace with actual topic | `feature/section-07` | `processing/section-07/` | Not started |

Each member should:
- Understand the assigned lecture and identify its algorithms.
- Implement the algorithms in the assigned module.
- Test normal and edge-case inputs.
- Document usage, parameters, examples, and test instructions.
- Coordinate integration requirements with the team.
- Use a feature branch and submit a pull request.

The team should separately agree who maintains the shared frontend, backend foundation, API contract, and final integration. Those responsibilities should not be assumed to belong to a section member unless explicitly assigned.

## Implementing a Course Section

Follow the same process for every section:

```text
Read lecture
    ↓
List concepts and algorithms
    ↓
Define inputs, outputs, and parameters
    ↓
Implement Python module
    ↓
Test independently
    ↓
Document usage
    ↓
Agree on API/operation integration
    ↓
Connect backend and frontend
    ↓
Run end-to-end tests
    ↓
Pull Request → Review → Merge
```

Suggested folder:

```text
processing/section-01/
├── README.md
├── algorithm_name.py
└── test_algorithm_name.py
```

Each section README should include:
- Section name and purpose.
- Concepts learned and algorithms implemented.
- Inputs, outputs, and parameters/ranges.
- How to run the code and tests.
- Example input and expected output.
- Known limitations.

Before integration, agree on a stable operation identifier, required parameters, input representation, result format, and error behavior. Avoid inventing a different API format for every section.

## Git and GitHub Workflow

**Do not work directly on `main`.** Work on a feature branch and merge through a reviewed pull request.

### 1. Update local `main`

Before starting work:

```bash
git checkout main
git pull origin main
```

### 2. Create a feature branch

Example for Member 3:

```bash
git checkout -b feature/section-03
```

Other branch examples:

```text
feature/section-01
feature/section-02
feature/frontend-upload
feature/backend-api
fix/image-preview
docs/update-readme
```

### 3. Work within your assigned scope

A section member should primarily modify their own folder, such as `processing/section-03/`. If a shared file or another member's module must change, discuss it with the team and explain the reason in the PR.

### 4. Inspect your changes

```bash
git status
git diff
```

Make sure you did not include unrelated files, secrets, virtual environments, uploaded images, or generated outputs.

### 5. Commit with a meaningful message

```bash
git add processing/section-03/
git commit -m "feat(section-03): implement assigned algorithms"
```

Other examples:

```bash
git commit -m "feat(frontend): improve image preview"
git commit -m "fix(upload): validate image file types"
git commit -m "test(section-02): add algorithm tests"
git commit -m "docs(section-04): document processing examples"
```

Avoid vague messages such as `update`, `final`, `test`, or `new changes`.

### 6. Push the branch

```bash
git push -u origin feature/section-03
```

### 7. Open a Pull Request

On GitHub, create a PR with:
- **Base:** `main`
- **Compare:** your feature branch

Describe what changed, how to test it, and any limitations.

### 8. Review and merge

At least one teammate should review the code for correctness, readability, tests, folder placement, architecture consistency, documentation, and regressions. Address review comments before merging.

### 9. Update after a merge

```bash
git checkout main
git pull origin main
```

If you need new `main` changes in an existing feature branch, coordinate with the team on whether to merge or rebase. Resolve conflicts carefully and test before pushing again.

### Workflow summary

```text
Update main → Create feature branch → Implement and test
     → Commit and push → Pull Request → Review
     → Address feedback → Merge into main
```

## Pull Request Checklist

Before requesting review:

- [ ] The change matches the assigned task.
- [ ] Files are in the agreed folders.
- [ ] The code runs and relevant tests pass.
- [ ] Inputs and parameters are validated.
- [ ] No unrelated files or secrets are included.
- [ ] Shared interfaces and operation identifiers match the agreed contract.
- [ ] Documentation is updated where needed.
- [ ] The PR explains what changed and how to test it.
- [ ] Existing functionality has not been broken.

Suggested PR description:

```markdown
## What changed?
- Describe the implemented algorithms or features.

## How to test
1. Provide setup or test commands.
2. Describe the input to use.
3. Describe the expected result.

## Tests
- [ ] Unit tests pass
- [ ] Integration tested (if applicable)

## Notes / limitations
- List known limitations or follow-up work.
```

## Definition of Done

A section is not complete just because its Python function runs. It is complete when:

- [ ] The assigned algorithm(s) are implemented.
- [ ] Normal and edge cases have been tested.
- [ ] Inputs and parameters are validated.
- [ ] The section README documents usage and examples.
- [ ] Backend integration is complete when the backend phase is active.
- [ ] Frontend controls are connected when UI integration is active.
- [ ] The result can be previewed and downloaded through the full workflow.
- [ ] The pull request has been reviewed and merged into `main`.

## Contribution Rules

1. **One system, one shared architecture.** Avoid creating disconnected mini-projects.
2. **Respect ownership.** Coordinate before changing another member's processing code.
3. **Keep shared utilities shared.** Put reusable helpers in `processing/common/` and discuss changes with the team.
4. **Keep layers separate.** Frontend handles interaction, backend coordinates requests, and processing modules implement algorithms.
5. **Test before opening a PR.** A reviewer should not be the first person to run the code.
6. **Document as you go.** Update the relevant README or docs when setup or behavior changes.
7. **Keep `main` stable.** Use feature branches, reviews, and small, understandable PRs.

## First Milestone Checklist

- [ ] Confirm the repository structure and GitHub workflow.
- [ ] Complete the shared frontend UI.
- [ ] Test image upload and original preview.
- [ ] Test operation controls and mock processing.
- [ ] Test result preview and download.
- [ ] Check responsive behavior.
- [ ] Assign the actual seven course sections.
- [ ] Agree on the backend API contract.

After this milestone, the team can develop the backend and section modules in parallel, then integrate and test the complete application.

```text
ONE APPLICATION
    + ONE SHARED ARCHITECTURE
    + SEVEN INDEPENDENT COURSE SECTIONS
    + TESTING AND DOCUMENTATION
    + FEATURE BRANCHES AND REVIEWED PULL REQUESTS
    = MULTIMEDIA LAB
```

**Welcome to Multimedia Lab — learn the concepts, implement the algorithms, and build one project together.**
