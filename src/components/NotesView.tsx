import React, { useState } from 'react';
import { Layers, Plus, Search, Trash2, Eye } from 'lucide-react';
import { StudyDocument } from '../types/study';
import { wordCount } from '../utils/textAnalysis';

interface NotesViewProps {
  notes: StudyDocument[];
  onSaveNote: (title: string, text: string, existingId?: string) => string;
  onDeleteNote: (noteId: string) => void;
  onReviewNote: (doc: StudyDocument) => void;
  onOpenFlashcards: (docId: string) => void;
  onToast: (msg: string, tone?: 'success' | 'info' | 'warn' | 'error') => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
  onReviewNote,
  onOpenFlashcards,
  onToast,
}) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(
    notes[0]?.id || null
  );
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState(notes[0]?.name || '');
  const [body, setBody] = useState(notes[0]?.text || '');

  const filteredNotes = notes.filter((n) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      n.name.toLowerCase().includes(q) ||
      n.text.toLowerCase().includes(q)
    );
  });

  const handleSelectNote = (note: StudyDocument) => {
    setActiveNoteId(note.id);
    setTitle(note.name);
    setBody(note.text);
  };

  const handleNewNote = () => {
    setActiveNoteId(null);
    setTitle('');
    setBody('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      onToast('Add both a title and note text before saving.', 'warn');
      return;
    }
    const savedId = onSaveNote(title.trim(), body.trim(), activeNoteId || undefined);
    setActiveNoteId(savedId);
    onToast('Note saved to your workspace.', 'success');
  };

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#6A55DC] mb-1">Think It Through</p>
          <h1 className="text-3xl font-extrabold text-[#211E36]">My Notes</h1>
          <p className="text-sm text-[#6E6B80] mt-1">
            Capture explanations, questions, and summaries in your own words. Saved notes also appear in your library.
          </p>
        </div>

        <button
          type="button"
          onClick={handleNewNote}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold hover:bg-[#5B47C7] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Saved Notes List */}
        <div className="lg:col-span-4 bg-white border border-[#EAE8F2] rounded-2xl p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8B889E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm text-[#211E36] focus:outline-none focus:border-[#6A55DC]"
            />
          </div>

          <p className="text-xs font-mono text-[#77758A] tabular-nums">
            {filteredNotes.length} saved {filteredNotes.length === 1 ? 'note' : 'notes'}
          </p>

          {filteredNotes.length > 0 ? (
            <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
              {filteredNotes.map((note) => {
                const isSelected = note.id === activeNoteId;
                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => handleSelectNote(note)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      isSelected
                        ? 'border-[#6A55DC] bg-[#F4F1FF]'
                        : 'border-transparent hover:bg-[#FAF9FD] hover:border-[#EAE8F2]'
                    }`}
                  >
                    <p className="text-sm font-bold text-[#211E36] truncate">
                      {note.name}
                    </p>
                    <p className="text-xs text-[#77758A] truncate mt-0.5">
                      {note.text.slice(0, 75)}
                    </p>
                    <p className="text-[11px] font-mono text-[#8B889E] mt-1 tabular-nums">
                      {wordCount(note.text)} words ·{' '}
                      {new Date(note.addedAt).toLocaleDateString()}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-xs text-[#77758A]">
                {notes.length > 0
                  ? 'No notes match your search.'
                  : 'Your saved notes will appear here.'}
              </p>
            </div>
          )}
        </div>

        {/* Note Editor */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-8 bg-white border border-[#EAE8F2] rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0EEF5] pb-3">
            <span className="text-xs font-mono text-[#77758A] tabular-nums">
              {activeNoteId ? 'Editing saved note' : 'New note draft'} ·{' '}
              {wordCount(body)} words
            </span>
            <div className="flex items-center gap-2">
              {activeNote && (
                <>
                  <button
                    type="button"
                    onClick={() => onReviewNote(activeNote)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E4F0] text-xs font-semibold text-[#3D3956] hover:bg-[#F8F6FF]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Quick Review
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenFlashcards(activeNote.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E4F0] text-xs font-semibold text-[#51469B] hover:bg-[#F8F6FF]"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Flashcards
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteNote(activeNote.id);
                      handleNewNote();
                      onToast('Note deleted.', 'info');
                    }}
                    className="p-1.5 rounded-lg text-[#8D899F] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                    aria-label="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="note-title-field" className="sr-only">
              Note title
            </label>
            <input
              id="note-title-field"
              type="text"
              maxLength={90}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this note a clear title..."
              className="w-full text-xl font-display font-bold text-[#211E36] placeholder:text-[#B5B2C4] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="note-body-field" className="sr-only">
              Note body
            </label>
            <textarea
              id="note-body-field"
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write down key concepts, definitions, or questions in your own words..."
              className="w-full text-sm text-[#2D2A42] leading-relaxed placeholder:text-[#B5B2C4] focus:outline-none resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#F0EEF5]">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold hover:bg-[#5B47C7]"
            >
              {activeNoteId ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
