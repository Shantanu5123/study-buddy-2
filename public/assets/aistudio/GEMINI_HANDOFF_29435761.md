# StudyBuddy handoff for Gemini

## Ready-to-paste request

Please review and help me finalize the attached StudyBuddy project. The main app is `streamlit_app.py`, a Python Streamlit version of a student study website. Keep it as a Streamlit/Python app and preserve the existing StudyBuddy purple visual style and student-friendly workflow. The original HTML, CSS, and JavaScript files are included as design/reference material; they are not the Streamlit app entry point.

### What is implemented

- Overview dashboard with study stats, a weekly focus chart, sample notes, and upload area.
- Upload PDF, DOCX, Markdown, and TXT files up to 20 MB each.
- PDF text extraction with `pypdf`; DOCX extraction with `python-docx`; plain text and Markdown decoding.
- Session library with search, extracted-text preview, and remove controls.
- Quick review, simple flashcards, and fill-in-the-blank quizzes generated with local text heuristics. These are not AI-generated and should be checked against the source document.
- Session notes and a focus/break timer.

### Important limits to preserve or improve deliberately

- App state is in Streamlit session memory only. There is no sign-in, database, or permanent document storage. A browser refresh or disconnected session clears session state.
- Scanned/image-only PDFs do not have selectable text, so the app currently cannot make study aids from them; OCR is not implemented.
- Do not claim that the app has AI features, OCR, accounts, or persistent storage unless you implement them.
- Do not delete or overwrite the supplied original HTML/CSS/JS reference files.

### Files

- `streamlit_app.py` — main Python app.
- `requirements.txt` — Python package dependencies.
- `.streamlit/config.toml` — Streamlit theme and 20 MB upload limit.
- `README.md` — local Windows setup and run instructions.
- `index.html`, `study.html`, `dashboard.html`, `profile.html`, `room.html`, `css/`, `js/`, and `assets/` — original website/reference files.

Please inspect the code and dependencies, identify concrete problems that could stop the app from starting or using its features, and make focused fixes while keeping the existing design and behavior. If you can run the app, report the exact command and whether it starts. Do not add a database, external AI API, authentication, or deployment setup unless I specifically ask. Finish with a concise list of changes and any remaining limitations.

## Run locally

From this project folder in PowerShell:

```powershell
py -m pip install -r requirements.txt
py -m streamlit run streamlit_app.py
```
