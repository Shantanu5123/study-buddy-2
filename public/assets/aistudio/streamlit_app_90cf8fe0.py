from __future__ import annotations

import hashlib
import io
import random
import re
import time
import uuid
from collections import Counter
from datetime import date, datetime, timedelta
from html import escape

import streamlit as st
from docx import Document as WordDocument
from pypdf import PdfReader


st.set_page_config(
    page_title="StudyBuddy Study Space",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded",
)

PAGES = ["Overview", "My library", "Flashcards", "Practice quiz", "My notes", "Focus timer"]
STOP_WORDS = set(
    "a about above after again against all am an and any are as at be because been before "
    "being between both but by can could did do does doing down during each few for from "
    "further had has have having he her here hers herself him himself his how i if in into "
    "is it its itself just me more most my myself no nor not of off on once only or other "
    "our ours ourselves out over own same she should so some such than that the their theirs "
    "them themselves then there these they this those through to too under until up very "
    "was we were what when where which while who whom why will with would you your yours "
    "yourself yourselves also using based learn learning material notes study session".split()
)

SAMPLE_TEXT = (
    "Active recall is a learning technique where you retrieve information from memory instead "
    "of simply rereading it. The effort of remembering strengthens the pathways that help you "
    "find the idea again later.\n\n"
    "Spaced practice means reviewing material across several short sessions over time. It helps "
    "move ideas into long-term memory more effectively than doing one long study session the "
    "night before an exam.\n\n"
    "Interleaving is the practice of switching between related topics or problem types during a "
    "study session. It encourages you to recognize which strategy fits a new problem.\n\n"
    "A useful study cycle is simple: read a small section, close the notes, write down what you "
    "remember, then check the source and correct gaps. Break a large chapter into short sections "
    "and return to each one after a delay."
)

CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
:root { --ink:#201d32; --muted:#77758a; --purple:#6a55dc; --line:#e9e7f0; }
.stApp { background:radial-gradient(ellipse at 80% 0%,rgba(230,225,255,.4),transparent 36%),#f4f3f8; color:var(--ink); font-family:'DM Sans',sans-serif; }
[data-testid="stSidebar"] { background:linear-gradient(180deg,#201c39 0%,#211e3b 55%,#19172d 100%); border-right:0; }
[data-testid="stSidebar"] * { color:#f5f2ff; }
[data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p { color:#aaa6bc; }
[data-testid="stSidebar"] [data-testid="stRadio"] label { color:#c8c3d9; }
[data-testid="stSidebar"] [data-testid="stRadio"] label:has(input:checked) { color:#fff; }
[data-testid="stSidebar"] [data-testid="stFileUploader"] section { background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.18); }
div.block-container { max-width:1280px; padding-top:2rem; padding-bottom:2.5rem; }
h1,h2,h3 { font-family:'Manrope',sans-serif !important; letter-spacing:-.04em; color:#211e36; }
h1 { font-size:2.25rem !important; }
[data-testid="stMetric"] { background:#fff; border:1px solid #eeecf4; border-radius:15px; padding:16px 18px; box-shadow:0 7px 20px rgba(40,31,82,.045); }
[data-testid="stMetricLabel"] { color:#8c899b !important; }
[data-testid="stMetricValue"] { color:#28253c !important; font-family:'Manrope',sans-serif; }
[data-testid="stVerticalBlockBorderWrapper"] { background:rgba(255,255,255,.96); border-color:#eeecf4 !important; border-radius:17px; box-shadow:0 8px 24px rgba(40,31,82,.045); }
.stButton > button, .stDownloadButton > button { border-radius:10px; border:1px solid #e5e1f0; color:#51469b; font-weight:700; background:#fff; transition:.18s ease; }
.stButton > button:hover, .stDownloadButton > button:hover { border-color:#b9aff0; color:#5142bd; background:#f8f6ff; }
.stButton > button[kind="primary"] { background:linear-gradient(135deg,#7c68ee,#624ed4); border:0; color:#fff; box-shadow:0 7px 17px rgba(103,83,218,.2); }
.stButton > button[kind="primary"]:hover { background:linear-gradient(135deg,#715ce2,#5944c9); color:#fff; }
.stTextInput input, .stTextArea textarea, .stSelectbox div[data-baseweb="select"] > div { border-radius:9px; }
.sb-brand { display:flex;align-items:center;gap:10px;margin:8px 0 28px;font:800 20px 'Manrope',sans-serif;letter-spacing:-.8px;color:#fff; }
.sb-mark { width:36px;height:36px;display:grid;place-items:center;border-radius:12px;background:linear-gradient(145deg,#8b79fa,#5f4dcc);box-shadow:0 7px 18px rgba(111,89,230,.3); }
.sb-brand b { color:#a99eff; }
.sb-caption { margin:0 0 8px;color:#89849e;font-size:10px;font-weight:700;letter-spacing:1.3px; }
.sb-privacy { margin-top:18px;padding:12px;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:rgba(255,255,255,.06);color:#b8b3c9;font-size:11px;line-height:1.55; }
.sb-kicker { display:inline-block;padding:6px 9px;border:1px solid #e7e2ff;border-radius:999px;background:#f4f1ff;color:#7562d8;font-size:10px;font-weight:700;letter-spacing:1.15px; }
.sb-subtitle { color:#858295;font-size:13px; }
.sb-hero { position:relative;overflow:hidden;padding:27px 28px;border-radius:20px;color:#fff;background:linear-gradient(115deg,#43388c 0%,#5949bc 48%,#7668df 100%);box-shadow:0 18px 38px rgba(81,65,173,.2); }
.sb-hero:after { content:'';position:absolute;width:240px;height:240px;right:-70px;bottom:-150px;border:1px solid rgba(255,255,255,.18);border-radius:50%;box-shadow:0 0 0 28px rgba(255,255,255,.05),0 0 0 58px rgba(255,255,255,.03); }
.sb-hero small { color:#c9c2ff;font-size:9px;font-weight:700;letter-spacing:1.5px; }
.sb-hero h2 { max-width:560px;margin:10px 0 8px;color:#fff;font:800 26px/1.25 'Manrope',sans-serif;letter-spacing:-.8px; }
.sb-hero p { max-width:570px;margin:0;color:#ded9ff;font-size:12px;line-height:1.65; }
.sb-section { margin:24px 0 10px; }
.sb-section h3 { margin:0;font-size:17px; }
.sb-section p { margin:4px 0 0;color:#9794a5;font-size:11px; }
.sb-document { padding:12px 14px;border:1px solid #f0eef5;border-radius:12px;background:linear-gradient(110deg,#fff,#fbfaff); }
.sb-doc-title { color:#39364c;font-weight:700;font-size:12px; }
.sb-doc-meta { margin-top:3px;color:#9a97a7;font-size:10px; }
.sb-note { padding:11px 13px;border-radius:10px;background:#f6f4ff;color:#6154af;font-size:11px;line-height:1.6; }
.sb-flash { min-height:190px;padding:28px;border:1px solid #e8e4fc;border-radius:17px;background:linear-gradient(145deg,#fff,#fbfaff);box-shadow:0 12px 32px rgba(40,31,82,.06);text-align:center; }
.sb-flash-label { color:#a09aa8;font-size:9px;font-weight:700;letter-spacing:1px; }
.sb-flash-text { margin:18px auto;font:700 20px/1.45 'Manrope',sans-serif;color:#302d43; }
.sb-timer { margin:18px 0 10px;text-align:center;font:800 clamp(54px,8vw,82px)/1 'Manrope',sans-serif;letter-spacing:-4px;color:#332b68;font-variant-numeric:tabular-nums; }
footer { visibility:hidden; }
</style>
"""


def init_state() -> None:
    defaults = {
        "page": "Overview",
        "documents": [],
        "seen_uploads": set(),
        "cards_by_doc": {},
        "quiz_by_doc": {},
        "stats": {"days": {}, "sessions": 0},
        "active_review": "",
        "selected_doc": "",
        "card_index": 0,
        "timer_mode": "Focus · 25 min",
        "timer": {"running": False, "ends_at": None, "remaining": 25 * 60, "mode": "focus"},
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


def word_count(text: str) -> int:
    return len((text or "").split())


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+|\n+", (text or "").replace("\r", " "))
    return [part.strip() for part in parts if 35 < len(part.strip()) < 360]


def top_terms(text: str, limit: int = 20) -> list[str]:
    words = re.findall(r"[a-z][a-z'-]{3,}", (text or "").lower())
    counts = Counter(word for word in words if word not in STOP_WORDS)
    return [word for word, _ in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:limit]]


def make_review(text: str, limit: int = 5) -> list[str]:
    lines = split_sentences(text)
    terms = top_terms(text, 12)
    ranked = []
    for index, sentence in enumerate(lines):
        lower = sentence.lower()
        score = sum(len(re.findall(rf"\b{re.escape(term)}\b", lower)) for term in terms)
        if 65 < len(sentence) < 230:
            score += 1
        ranked.append((score, index, sentence))
    return [sentence for _, _, sentence in sorted(sorted(ranked, reverse=True)[:limit], key=lambda item: item[1])]


def make_flashcards(text: str, doc_id: str) -> list[dict[str, str]]:
    lines = split_sentences(text)
    cards: list[dict[str, str]] = []
    used: set[str] = set()
    definitions = re.findall(
        r"([^.!?\n]{2,65}?\s+(?:is|are|means|refers to|describes)\s+[^.!?\n]{20,230})",
        text or "",
        flags=re.IGNORECASE,
    )
    for line in definitions:
        match = re.match(r"^(.{2,65}?)\s+(is|are|means|refers to|describes)\s+(.+)$", line.strip(), re.I)
        if match and len(match.group(1).split()) <= 7 and len(cards) < 5:
            verb = "does" if match.group(2).lower() == "means" else "is"
            cards.append({"id": uuid.uuid4().hex, "doc_id": doc_id, "question": f"What {verb} {match.group(1).strip()}?", "answer": match.group(3).strip().rstrip(".") + "."})
    for term in top_terms(text, 24):
        if len(cards) >= 10 or term in used:
            continue
        source = next((line for line in lines if term in line.lower() and len(line.split()) > 7), None)
        if source:
            used.add(term)
            cards.append({"id": uuid.uuid4().hex, "doc_id": doc_id, "question": f"What do your notes say about “{term}”?", "answer": source})
    return cards


def make_quiz(text: str) -> list[dict[str, object]]:
    lines = split_sentences(text)
    terms = top_terms(text, 28)
    questions: list[dict[str, object]] = []
    used_lines: set[str] = set()
    for term in terms:
        source = next((line for line in lines if term in line.lower() and len(line.split()) > 8), None)
        if not source or source in used_lines:
            continue
        blanked = re.sub(rf"\b{re.escape(term)}\b", "_____", source, count=1, flags=re.I)
        if blanked == source:
            continue
        distractors = [other for other in terms if other != term and other not in source.lower()][:3]
        if len(distractors) < 2:
            continue
        options = [term, *distractors]
        random.shuffle(options)
        questions.append({"prompt": blanked, "answer": term, "options": options})
        used_lines.add(source)
        if len(questions) == 5:
            break
    return questions


def extract_text(filename: str, data: bytes) -> str:
    suffix = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if suffix == "pdf":
        reader = PdfReader(io.BytesIO(data))
        chunks = []
        for page in reader.pages[:80]:
            chunks.append(page.extract_text() or "")
        return "\n\n".join(chunks)[:250_000]
    if suffix == "docx":
        document = WordDocument(io.BytesIO(data))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)[:250_000]
    if suffix in {"txt", "md", "markdown"}:
        for encoding in ("utf-8-sig", "utf-16", "latin-1"):
            try:
                return data.decode(encoding)[:250_000]
            except UnicodeDecodeError:
                continue
    raise ValueError("Use a PDF, Word, Markdown, or text file.")


def format_size(size: int) -> str:
    if size >= 1024 * 1024:
        return f"{size / (1024 * 1024):.1f} MB"
    if size >= 1024:
        return f"{size / 1024:.0f} KB"
    return f"{size} B"


def process_uploads(files) -> int:
    added = 0
    for uploaded in files or []:
        data = uploaded.getvalue()
        signature = hashlib.sha256(data).hexdigest()
        if signature in st.session_state.seen_uploads:
            continue
        try:
            text = extract_text(uploaded.name, data)
        except Exception as error:  # Show a file-specific message without stopping other uploads.
            st.error(f"Could not read {uploaded.name}: {error}")
            continue
        doc_id = uuid.uuid4().hex
        st.session_state.documents.insert(
            0,
            {
                "id": doc_id,
                "name": uploaded.name,
                "type": uploaded.name.rsplit(".", 1)[-1].lower(),
                "kind": "file",
                "size": len(data),
                "added_at": datetime.now().isoformat(timespec="seconds"),
                "text": text,
                "signature": signature,
            },
        )
        st.session_state.seen_uploads.add(signature)
        st.session_state.selected_doc = doc_id
        added += 1
        if not text.strip():
            st.warning(f"{uploaded.name} has no selectable text. Scanned PDFs need OCR.")
    return added


def add_sample() -> None:
    if any(doc["id"] == "sample-active-recall" for doc in st.session_state.documents):
        st.session_state.selected_doc = "sample-active-recall"
        return
    st.session_state.documents.insert(
        0,
        {
            "id": "sample-active-recall",
            "name": "Sample — learning techniques.txt",
            "type": "txt",
            "kind": "sample",
            "size": len(SAMPLE_TEXT.encode("utf-8")),
            "added_at": datetime.now().isoformat(timespec="seconds"),
            "text": SAMPLE_TEXT,
            "signature": "sample-active-recall",
        },
    )
    st.session_state.selected_doc = "sample-active-recall"


def selected_doc(key: str = "selected_doc") -> dict | None:
    docs = [doc for doc in st.session_state.documents if doc.get("text", "").strip()]
    if not docs:
        return None
    options = [doc["id"] for doc in docs]
    if st.session_state.get(key) not in options:
        st.session_state[key] = options[0]
    names = {doc["id"]: doc["name"] for doc in docs}
    doc_id = st.selectbox("Choose study material", options, format_func=lambda value: names[value], key=f"select_{key}")
    st.session_state[key] = doc_id
    return next(doc for doc in docs if doc["id"] == doc_id)


def go_to(page: str) -> None:
    st.session_state.page = page


def doc_icon(doc: dict) -> str:
    if doc.get("kind") == "note":
        return "📝"
    return {"pdf": "📕", "docx": "📘", "md": "📄", "markdown": "📄", "txt": "📃"}.get(doc.get("type"), "📄")


def doc_subtitle(doc: dict) -> str:
    words = word_count(doc.get("text", ""))
    if doc.get("kind") == "note":
        return f"NOTE · {words:,} words"
    return f"{doc.get('type', 'FILE').upper()} · {format_size(doc.get('size', 0))} · {words:,} words"


def render_document_row(doc: dict, key_prefix: str = "doc") -> None:
    with st.container(border=True):
        left, review_col, cards_col, delete_col = st.columns([5, 1.2, 1.25, 0.75], vertical_alignment="center")
        with left:
            st.markdown(f"<div class='sb-doc-title'>{doc_icon(doc)} &nbsp; {escape(doc['name'])}</div><div class='sb-doc-meta'>{escape(doc_subtitle(doc))}</div>", unsafe_allow_html=True)
        with review_col:
            if st.button("Review", key=f"{key_prefix}_review_{doc['id']}"):
                st.session_state.active_review = doc["id"]
                st.rerun()
        with cards_col:
            if st.button("Cards", key=f"{key_prefix}_cards_{doc['id']}"):
                st.session_state.selected_doc = doc["id"]
                st.session_state.cards_by_doc[doc["id"]] = make_flashcards(doc.get("text", ""), doc["id"])
                go_to("Flashcards")
                st.rerun()
        with delete_col:
            if st.button("✕", key=f"{key_prefix}_delete_{doc['id']}", help="Remove from this session"):
                st.session_state.documents = [item for item in st.session_state.documents if item["id"] != doc["id"]]
                st.session_state.cards_by_doc.pop(doc["id"], None)
                st.session_state.quiz_by_doc.pop(doc["id"], None)
                st.rerun()
        with st.expander("Preview extracted text"):
            excerpt = doc.get("text", "")[:4000]
            st.text(excerpt if excerpt else "No selectable text was extracted from this file.")
            if len(doc.get("text", "")) > 4000:
                st.caption("Preview shortened. Use your original file for the full document.")


def render_review_panel(doc: dict | None) -> None:
    if not doc:
        return
    with st.container(border=True):
        title_col, close_col = st.columns([5, 1])
        with title_col:
            st.markdown(f"### Quick review · {doc['name']}")
            st.caption("Key sentences selected from your source text. This is a local reading aid, not an AI summary.")
        with close_col:
            if st.button("Close", key="close_review"):
                st.session_state.active_review = ""
                st.rerun()
        points = make_review(doc.get("text", ""))
        if points:
            for point in points:
                st.markdown(f"- {point}")
        else:
            st.info("There isn’t enough selectable text to make a quick review yet.")


def today_minutes() -> int:
    return int(st.session_state.stats["days"].get(date.today().isoformat(), 0))


def render_week_bars() -> None:
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    labels = ["M", "T", "W", "T", "F", "S", "S"]
    bars = []
    for offset, label in enumerate(labels):
        day = monday + timedelta(days=offset)
        minutes = int(st.session_state.stats["days"].get(day.isoformat(), 0))
        height = max(5, min(34, minutes / 2))
        color = "#705bdd" if day == today else "#bcb0fb" if minutes else "#eeecf5"
        bars.append(f"<div style='flex:1;text-align:center;color:#9996a8;font-size:9px'><div title='{minutes} min' style='height:{height}px;max-width:16px;margin:0 auto 5px;border-radius:5px 5px 2px 2px;background:{color}'></div>{label}</div>")
    st.markdown("<div style='display:flex;align-items:end;gap:10px;height:55px;margin-top:12px'>" + "".join(bars) + "</div>", unsafe_allow_html=True)


def render_uploader(key: str = "study_upload") -> None:
    uploads = st.file_uploader(
        "Add PDF, Word, Markdown, or text files",
        type=["pdf", "docx", "txt", "md", "markdown"],
        accept_multiple_files=True,
        key=key,
        help="Files are processed by the Streamlit app server and kept in this session only.",
        max_upload_size=20,
    )
    count = process_uploads(uploads)
    if count:
        st.success(f"Added {count} { 'material' if count == 1 else 'materials' } to this session.")


def render_overview() -> None:
    hour = datetime.now().hour
    greeting = "Good morning" if hour < 12 else "Good afternoon" if hour < 18 else "Good evening"
    docs = st.session_state.documents
    total_cards = sum(len(deck) for deck in st.session_state.cards_by_doc.values())
    minutes_total = sum(int(value) for value in st.session_state.stats["days"].values())

    st.markdown("<span class='sb-kicker'>YOUR STUDY SPACE</span>", unsafe_allow_html=True)
    st.title(f"{greeting}.")
    st.markdown("<p class='sb-subtitle'>A calm place to turn class material into progress.</p>", unsafe_allow_html=True)

    metric_cols = st.columns(4)
    for column, label, value, icon in zip(
        metric_cols,
        ["Study materials", "Flashcards made", "Minutes focused", "Focus sessions"],
        [len(docs), total_cards, minutes_total, st.session_state.stats["sessions"]],
        ["📂", "▤", "◷", "✓"],
    ):
        with column:
            st.metric(f"{icon}  {label}", value)

    st.write("")
    hero_col, focus_col = st.columns([1.65, 0.85], gap="medium")
    with hero_col:
        st.markdown(
            "<div class='sb-hero'><small>YOUR MATERIAL, YOUR MOMENTUM</small>"
            "<h2>Make more of what you’re already studying.</h2>"
            "<p>Add class notes or a reading. Create quick reviews, flashcards, and practice questions right here.</p></div>",
            unsafe_allow_html=True,
        )
        render_uploader("overview_upload")
        sample_col, privacy_col = st.columns([1, 2], vertical_alignment="center")
        with sample_col:
            if st.button("Try a sample", key="overview_sample"):
                add_sample()
                st.rerun()
        with privacy_col:
            st.caption("PDF, DOCX, Markdown, TXT · max 20 MB each")
    with focus_col:
        with st.container(border=True):
            st.markdown("### Today’s focus")
            st.caption("60-minute goal")
            mins = today_minutes()
            st.progress(min(mins / 60, 1.0), text=f"{mins} / 60 min")
            st.caption("Small sessions still count.")
        with st.container(border=True):
            st.markdown("### This week")
            st.caption("Focus minutes")
            render_week_bars()

    review_doc = next((doc for doc in docs if doc["id"] == st.session_state.active_review), None)
    render_review_panel(review_doc)

    left, right = st.columns([1.35, 0.85], gap="medium")
    with left:
        with st.container(border=True):
            st.markdown("### Recently added")
            st.caption("Pick up where you left off")
            if docs:
                for doc in docs[:4]:
                    render_document_row(doc, "overview")
            else:
                st.info("Your library is ready for its first file. Upload a document above or try the sample notes.")
    with right:
        with st.container(border=True):
            st.markdown("### Study toolkit")
            st.caption("A few ways to keep moving")
            if st.button("✨  Quick review", use_container_width=True, key="overview_review"):
                doc = docs[0] if docs else None
                if doc:
                    st.session_state.active_review = doc["id"]
                    st.rerun()
                else:
                    st.info("Add a document first, or load the sample notes.")
            if st.button("▤  Make flashcards", use_container_width=True, key="overview_cards"):
                doc = docs[0] if docs else None
                if doc:
                    st.session_state.selected_doc = doc["id"]
                    st.session_state.cards_by_doc[doc["id"]] = make_flashcards(doc.get("text", ""), doc["id"])
                    go_to("Flashcards")
                    st.rerun()
                else:
                    st.info("Add a document first, or load the sample notes.")
            if st.button("◷  Start a focus session", use_container_width=True, key="overview_timer"):
                go_to("Focus timer")
                st.rerun()
    st.caption("Study materials and progress stay in this Streamlit session. A browser refresh or disconnected session clears them.")


def render_library() -> None:
    st.markdown("<span class='sb-kicker'>YOUR MATERIALS</span>", unsafe_allow_html=True)
    st.title("My library")
    st.markdown("<p class='sb-subtitle'>Bring your class materials together and keep them ready to study.</p>", unsafe_allow_html=True)
    render_uploader("library_upload")
    docs = st.session_state.documents
    search_col, filter_col = st.columns([2, 1])
    with search_col:
        query = st.text_input("Search materials", placeholder="Search titles or extracted text", key="library_query")
    with filter_col:
        file_filter = st.selectbox("Type", ["All materials", "PDF", "Word", "Text", "Notes"])
    type_map = {"PDF": {"pdf"}, "Word": {"docx"}, "Text": {"txt", "md", "markdown"}}
    filtered = [doc for doc in docs if query.lower() in (doc["name"] + " " + doc.get("text", "")).lower()]
    if file_filter == "Notes":
        filtered = [doc for doc in filtered if doc.get("kind") == "note"]
    elif file_filter in type_map:
        filtered = [doc for doc in filtered if doc.get("type") in type_map[file_filter]]
    st.caption(f"{len(filtered)} { 'item' if len(filtered) == 1 else 'items' }")
    review_doc = next((doc for doc in docs if doc["id"] == st.session_state.active_review), None)
    render_review_panel(review_doc)
    if filtered:
        for doc in filtered:
            render_document_row(doc, "library")
    else:
        st.info("No files match that search yet." if docs else "Your library is empty. Add your first material above.")
    st.markdown("<div class='sb-note'>🔒 Uploaded files are processed by the Streamlit app server and held in session memory. They are not written to a permanent database by this app.</div>", unsafe_allow_html=True)


def render_flashcards() -> None:
    st.markdown("<span class='sb-kicker'>ACTIVE RECALL</span>", unsafe_allow_html=True)
    st.title("Flashcards")
    st.markdown("<p class='sb-subtitle'>Practice remembering the ideas in your own study material.</p>", unsafe_allow_html=True)
    doc = selected_doc("cards_doc")
    if not doc:
        st.info("Add a text-based document in My library to create flashcards.")
        return
    st.markdown("<div class='sb-note'>Cards are quick drafts from definitions and key sentences. Review them against your original material.</div>", unsafe_allow_html=True)
    deck = st.session_state.cards_by_doc.get(doc["id"], [])
    if not deck:
        if st.button("✨  Create flashcards", type="primary"):
            deck = make_flashcards(doc.get("text", ""), doc["id"])
            st.session_state.cards_by_doc[doc["id"]] = deck
            st.session_state.card_index = 0
            st.rerun()
        return
    index = st.session_state.card_index % len(deck)
    card = deck[index]
    flipped = st.toggle("Show answer", key=f"flash_flip_{doc['id']}_{index}")
    with st.container(border=True):
        st.markdown(f"<div class='sb-flash'><div class='sb-flash-label'>{'ANSWER' if flipped else 'QUESTION'} · CARD {index + 1} OF {len(deck)}</div><div class='sb-flash-text'>{escape(card['answer'] if flipped else card['question'])}</div><div class='sb-doc-meta'>Try to recall before revealing the answer.</div></div>", unsafe_allow_html=True)
    previous_col, next_col, recreate_col = st.columns([1, 1, 2])
    with previous_col:
        if st.button("← Previous", use_container_width=True):
            st.session_state.card_index = (index - 1) % len(deck)
            st.rerun()
    with next_col:
        if st.button("Next →", use_container_width=True):
            st.session_state.card_index = (index + 1) % len(deck)
            st.rerun()
    with recreate_col:
        if st.button("Rebuild this deck", use_container_width=True):
            st.session_state.cards_by_doc[doc["id"]] = make_flashcards(doc.get("text", ""), doc["id"])
            st.session_state.card_index = 0
            st.rerun()


def render_quiz() -> None:
    st.markdown("<span class='sb-kicker'>CHECK WHAT STUCK</span>", unsafe_allow_html=True)
    st.title("Practice quiz")
    st.markdown("<p class='sb-subtitle'>A quick, low-pressure check made from your own study notes.</p>", unsafe_allow_html=True)
    doc = selected_doc("quiz_doc")
    if not doc:
        st.info("Add a text-based document in My library to create a quiz.")
        return
    left, right = st.columns([1, 1])
    with left:
        if st.button("Create practice quiz", type="primary"):
            st.session_state.quiz_by_doc[doc["id"]] = {
                "questions": make_quiz(doc.get("text", "")),
                "index": 0,
                "score": 0,
                "checked": False,
                "run_id": uuid.uuid4().hex[:8],
            }
            st.rerun()
    with right:
        st.caption("Questions use simple fill-in prompts from extracted text. Check the source if an answer feels off.")
    quiz = st.session_state.quiz_by_doc.get(doc["id"])
    if not quiz:
        return
    questions = quiz["questions"]
    if not questions:
        st.warning("This document needs a little more selectable text to create a quiz.")
        return
    index = quiz["index"]
    if index >= len(questions):
        with st.container(border=True):
            st.markdown("### Quiz complete")
            st.metric("Correct answers", f"{quiz['score']} / {len(questions)}")
            st.caption("Use your notes to revisit any term you want to strengthen.")
        return
    question = questions[index]
    with st.container(border=True):
        st.caption(f"QUESTION {index + 1} OF {len(questions)} · {quiz['score']} CORRECT SO FAR")
        st.markdown(f"### {question['prompt']}")
        answer = st.radio("Choose the missing term", question["options"], key=f"quiz_answer_{quiz['run_id']}_{index}", label_visibility="collapsed")
        if not quiz["checked"]:
            if st.button("Check answer", type="primary"):
                quiz["checked"] = True
                quiz["last_correct"] = answer.lower() == str(question["answer"]).lower()
                if quiz["last_correct"]:
                    quiz["score"] += 1
                st.rerun()
        else:
            if quiz.get("last_correct"):
                st.success("That’s right.")
            else:
                st.info(f"The answer is **{question['answer']}**. Revisit the sentence in your notes.")
            if st.button("Next question →", type="primary"):
                quiz["index"] += 1
                quiz["checked"] = False
                st.rerun()


def render_notes() -> None:
    st.markdown("<span class='sb-kicker'>THINK IT THROUGH</span>", unsafe_allow_html=True)
    st.title("My notes")
    st.markdown("<p class='sb-subtitle'>Capture the questions, connections, and ideas you want to keep.</p>", unsafe_allow_html=True)
    left, right = st.columns([1, 1], gap="medium")
    with left:
        with st.container(border=True):
            st.markdown("### Write a note")
            with st.form("note_form", clear_on_submit=True):
                title = st.text_input("Title", placeholder="Give this note a title", max_chars=90)
                body = st.text_area("Your thought", placeholder="Add a question, explanation, or connection in your own words…", height=150)
                submitted = st.form_submit_button("Save note", type="primary")
            if submitted:
                if not title.strip() or not body.strip():
                    st.warning("Add both a title and some note text.")
                else:
                    st.session_state.documents.insert(0, {"id": uuid.uuid4().hex, "name": title.strip(), "type": "note", "kind": "note", "size": 0, "added_at": datetime.now().isoformat(timespec="seconds"), "text": body.strip(), "signature": ""})
                    st.success("Your note is saved for this session.")
                    st.rerun()
    with right:
        with st.container(border=True):
            notes = [doc for doc in st.session_state.documents if doc.get("kind") == "note"]
            st.markdown(f"### Saved notes · {len(notes)}")
            if not notes:
                st.caption("Your saved notes will show up here.")
            for note in notes:
                with st.expander(note["name"]):
                    st.write(note["text"])
                    if st.button("Delete note", key=f"delete_note_{note['id']}"):
                        st.session_state.documents = [doc for doc in st.session_state.documents if doc["id"] != note["id"]]
                        st.rerun()


def timer_duration(mode: str) -> int:
    return 25 * 60 if mode.startswith("Focus") else 5 * 60 if mode.startswith("Short") else 15 * 60


def start_timer() -> None:
    timer = st.session_state.timer
    remaining = timer.get("remaining") or timer_duration(st.session_state.timer_mode)
    timer["ends_at"] = time.time() + remaining
    timer["running"] = True
    timer["mode"] = "focus" if st.session_state.timer_mode.startswith("Focus") else "break"


def pause_timer() -> None:
    timer = st.session_state.timer
    timer["remaining"] = max(0, int((timer.get("ends_at") or time.time()) - time.time()))
    timer["running"] = False
    timer["ends_at"] = None


def reset_timer() -> None:
    timer = st.session_state.timer
    timer["running"] = False
    timer["ends_at"] = None
    timer["remaining"] = timer_duration(st.session_state.timer_mode)


@st.fragment(run_every="1s")
def render_timer_clock() -> None:
    timer = st.session_state.timer
    if timer["running"]:
        remaining = max(0, int((timer.get("ends_at") or time.time()) - time.time()))
        if remaining == 0:
            timer["running"] = False
            timer["ends_at"] = None
            timer["remaining"] = 0
            if timer.get("mode") == "focus":
                today_key = date.today().isoformat()
                st.session_state.stats["days"][today_key] = int(st.session_state.stats["days"].get(today_key, 0)) + 25
                st.session_state.stats["sessions"] += 1
                st.success("Focus session complete. Take a short reset.")
            else:
                st.success("Break complete. Ready when you are.")
        else:
            timer["remaining"] = remaining
    remaining = int(timer.get("remaining", 0))
    clock = f"{remaining // 60:02d}:{remaining % 60:02d}"
    st.markdown(f"<div class='sb-timer'>{clock}</div>", unsafe_allow_html=True)
    col1, col2 = st.columns([1.5, 1])
    with col1:
        if timer["running"]:
            st.button("Pause session", on_click=pause_timer, type="primary", use_container_width=True, key="timer_pause")
        else:
            st.button("Start session", on_click=start_timer, type="primary", use_container_width=True, key="timer_start")
    with col2:
        st.button("Reset", on_click=reset_timer, use_container_width=True, key="timer_reset")


def render_focus() -> None:
    st.markdown("<span class='sb-kicker'>ONE THING AT A TIME</span>", unsafe_allow_html=True)
    st.title("Focus timer")
    st.markdown("<p class='sb-subtitle'>Settle into a short session. Pause whenever you need.</p>", unsafe_allow_html=True)
    left, right = st.columns([1.2, 0.8], gap="medium")
    with left:
        with st.container(border=True):
            mode = st.radio("Session length", ["Focus · 25 min", "Short break · 5 min", "Long break · 15 min"], horizontal=True, key="timer_mode")
            if not st.session_state.timer["running"]:
                duration = timer_duration(mode)
                if st.session_state.timer.get("remaining", 0) <= 0 or st.session_state.timer.get("mode") != ("focus" if mode.startswith("Focus") else "break"):
                    st.session_state.timer["remaining"] = duration
                st.session_state.timer["mode"] = "focus" if mode.startswith("Focus") else "break"
            st.markdown("<div style='text-align:center;color:#746f87;font-size:10px;font-weight:700;letter-spacing:1px'>" + escape(mode.upper()) + "</div>", unsafe_allow_html=True)
            render_timer_clock()
            docs = [doc for doc in st.session_state.documents if doc.get("text", "").strip()]
            if docs:
                names = {doc["id"]: doc["name"] for doc in docs}
                st.selectbox("What are you working on?", list(names), format_func=lambda value: names[value], key="focus_doc")
    with right:
        with st.container(border=True):
            st.markdown("### Make room for a reset")
            st.write("Choose one small task for focus time. When the timer ends, stretch, get a drink, or look away from the screen for a few minutes.")
            mins = today_minutes()
            st.progress(min(mins / 60, 1.0), text=f"{mins} / 60 focus minutes today")
            st.caption(f"{st.session_state.stats['sessions']} completed focus sessions this session")
            st.caption("The timer runs while this app session stays open.")


def main() -> None:
    init_state()
    st.markdown(CSS, unsafe_allow_html=True)
    with st.sidebar:
        st.markdown("<div class='sb-brand'><span class='sb-mark'>📖</span><span>study<b>buddy</b></span></div>", unsafe_allow_html=True)
        st.markdown("<div class='sb-caption'>YOUR WORKSPACE</div>", unsafe_allow_html=True)
        st.radio("Workspace", PAGES, key="page", label_visibility="collapsed")
        st.divider()
        st.markdown("<div class='sb-privacy'>🛡️ <b>Session privacy</b><br>Uploaded text is processed on the app server and kept in memory for this session. Refreshing or disconnecting clears it.</div>", unsafe_allow_html=True)
        st.caption("StudyBuddy · Streamlit edition")

    page = st.session_state.page
    if page == "Overview":
        render_overview()
    elif page == "My library":
        render_library()
    elif page == "Flashcards":
        render_flashcards()
    elif page == "Practice quiz":
        render_quiz()
    elif page == "My notes":
        render_notes()
    else:
        render_focus()


if __name__ == "__main__":
    main()
