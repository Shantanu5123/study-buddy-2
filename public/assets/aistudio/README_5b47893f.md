# StudyBuddy · Streamlit edition

This folder includes a Python version of the StudyBuddy study space. The original HTML pages are still here; Streamlit runs from `streamlit_app.py`.

## Run it on Windows

1. Install Python 3.10 or newer.
2. Open PowerShell in this folder.
3. Install the app packages:

   ```powershell
   py -m pip install -r requirements.txt
   ```

4. Start the app:

   ```powershell
   py -m streamlit run streamlit_app.py
   ```

Streamlit will open the app in your browser. If the `py` command is unavailable, use `python` in its place.

## Features

- Upload PDF, DOCX, Markdown, and TXT study material (up to 20 MB per file).
- Search a session library and preview extracted text.
- Create quick reviews, flashcards, and practice quizzes from uploaded text.
- Save session notes and use a focus timer.

Study aids are generated with local text heuristics; this app does not call an AI service. Scanned PDFs without selectable text need OCR before the app can make study aids from them.

## Session storage

Uploads are processed by the Streamlit app server. Extracted text, notes, and progress stay in Streamlit session memory and are not saved to a permanent database. A browser refresh or disconnected session resets that data. For a public deployment, add user authentication and persistent, access-controlled storage before collecting students' private documents.
