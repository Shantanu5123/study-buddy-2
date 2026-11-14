import React, { useRef, useState } from 'react';
import {
  Upload,
  Search,
  Eye,
  Layers,
  HelpCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Bot,
} from 'lucide-react';
import { StudyDocument, TutorLaunchContext } from '../types/study';
import { formatFileSize, wordCount } from '../utils/textAnalysis';

interface LibraryViewProps {
  documents: StudyDocument[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isUploading: boolean;
  onUploadFiles: (files: FileList | null) => void;
  onAddSample: () => void;
  onReviewDoc: (doc: StudyDocument) => void;
  onOpenFlashcards: (docId: string) => void;
  onOpenQuiz: (docId: string) => void;
  onOpenTutor: (ctx: TutorLaunchContext) => void;
  onDeleteDoc: (docId: string) => void;
}

type TypeFilter = 'all' | 'pdf' | 'docx' | 'text' | 'note';

export const LibraryView: React.FC<LibraryViewProps> = ({
  documents,
  searchQuery,
  onSearchChange,
  isUploading,
  onUploadFiles,
  onAddSample,
  onReviewDoc,
  onOpenFlashcards,
  onOpenQuiz,
  onOpenTutor,
  onDeleteDoc,
}) => {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = documents.filter((doc) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      doc.name.toLowerCase().includes(q) ||
      doc.text.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (typeFilter === 'all') return true;
    if (typeFilter === 'note') return doc.kind === 'note';
    if (typeFilter === 'pdf') return doc.type === 'pdf';
    if (typeFilter === 'docx') return doc.type === 'docx';
    return doc.type === 'txt' || doc.type === 'md' || doc.type === 'markdown';
  });

  const filterOptions: { id: TypeFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pdf', label: 'PDF' },
    { id: 'docx', label: 'Word' },
    { id: 'text', label: 'Text & MD' },
    { id: 'note', label: 'Notes' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#6A55DC] mb-1">Your Materials</p>
        <h1 className="text-3xl font-extrabold text-[#211E36]">My Library</h1>
        <p className="text-sm text-[#6E6B80] mt-1">
          Bring class readings, lecture slides, and notes together so you can turn them into study aids or ask the AI Tutor.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          onUploadFiles(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? 'border-[#6A55DC] bg-[#F3F0FF]'
            : 'border-[#DDD9EC] bg-white hover:border-[#6A55DC]/50'
        }`}
      >
        <div className="max-w-md mx-auto">
          <div className="w-11 h-11 rounded-xl bg-[#F4F1FF] text-[#6A55DC] flex items-center justify-center mx-auto mb-3">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-[#211E36]">
            {isUploading ? 'Extracting text from your files...' : 'Drop study files here or browse'}
          </p>
          <p className="text-xs text-[#77758A] mt-1">
            Supports PDF, Word (.docx), Markdown (.md), and TXT up to 20 MB each.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold hover:bg-[#5B47C7] whitespace-nowrap disabled:opacity-60"
            >
              Choose Files
            </button>
            <button
              type="button"
              onClick={onAddSample}
              className="px-4 py-2 rounded-xl border border-[#E2DEF2] bg-white text-sm font-semibold text-[#4E4396] hover:bg-[#F8F6FF] whitespace-nowrap"
            >
              Load Sample Notes
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,.markdown"
          multiple
          className="hidden"
          onChange={(e) => {
            onUploadFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8B889E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search titles or extracted text..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#E6E4F0] text-sm text-[#211E36] placeholder:text-[#9895AA] focus:outline-none focus:border-[#6A55DC]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-[#E6E4F0] rounded-xl overflow-x-auto">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTypeFilter(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                typeFilter === opt.id
                  ? 'bg-[#6A55DC] text-white'
                  : 'text-[#6E6B80] hover:text-[#211E36] hover:bg-[#F4F3F8]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-xs font-medium text-[#77758A] font-mono tabular-nums">
        {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
      </p>

      {/* Document List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((doc) => {
            const isExpanded = expandedDocId === doc.id;
            return (
              <div
                key={doc.id}
                className="bg-white border border-[#EAE8F2] rounded-2xl p-4 sm:p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F1FF] text-[#6A55DC] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#211E36] truncate">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-[#77758A] font-mono tabular-nums mt-0.5">
                        {doc.kind === 'note' ? 'Note' : doc.type.toUpperCase()} ·{' '}
                        {doc.kind !== 'note' && `${formatFileSize(doc.size)} · `}
                        {wordCount(doc.text).toLocaleString()} words
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenTutor({
                          documentTitle: doc.name,
                          documentText: doc.text,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DFD8FA] bg-[#F4F1FF] text-xs font-semibold text-[#4E4396] hover:bg-[#EAE4FF] whitespace-nowrap"
                    >
                      <Bot className="w-3.5 h-3.5 text-[#6A55DC]" />
                      Ask AI Tutor
                    </button>
                    <button
                      type="button"
                      onClick={() => onReviewDoc(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E4F0] bg-white text-xs font-semibold text-[#3E395C] hover:bg-[#F8F6FF] whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Quick Review
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenFlashcards(doc.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E4F0] bg-white text-xs font-semibold text-[#51469B] hover:bg-[#F8F6FF] whitespace-nowrap"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Flashcards
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenQuiz(doc.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E4F0] bg-white text-xs font-semibold text-[#51469B] hover:bg-[#F8F6FF] whitespace-nowrap"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Quiz
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#6E6B80] hover:bg-[#F4F3F8] whitespace-nowrap"
                    >
                      {isExpanded ? (
                        <>
                          Hide Text <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          Preview <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteDoc(doc.id)}
                      className="p-1.5 rounded-lg text-[#8D899F] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                      aria-label={`Delete ${doc.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#F0EEF5]">
                    <pre className="text-xs font-mono text-[#46425E] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto bg-[#FAF9FD] p-3.5 rounded-xl border border-[#EEEBF5]">
                      {doc.text.slice(0, 4000) ||
                        'No selectable text was extracted from this file. Scanned PDFs need OCR before text can be extracted.'}
                    </pre>
                    {doc.text.length > 4000 && (
                      <p className="text-[11px] text-[#8B889E] mt-2">
                        Preview truncated at 4,000 characters. Study aids still process the full extracted text.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#EAE8F2] rounded-2xl p-10 text-center">
          <p className="text-sm font-semibold text-[#211E36]">
            {documents.length > 0 ? 'No materials match your current filter.' : 'Your library is empty.'}
          </p>
          <p className="text-xs text-[#77758A] mt-1">
            {documents.length > 0
              ? 'Clear your search query or switch the type filter above.'
              : 'Upload a file above or load the sample notes to get started.'}
          </p>
        </div>
      )}
    </div>
  );
};
