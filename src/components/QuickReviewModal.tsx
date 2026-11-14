import React from 'react';
import { X, Layers, HelpCircle } from 'lucide-react';
import { StudyDocument } from '../types/study';
import { makeQuickReview } from '../utils/textAnalysis';

interface QuickReviewModalProps {
  doc: StudyDocument | null;
  onClose: () => void;
  onOpenFlashcards: (docId: string) => void;
  onOpenQuiz: (docId: string) => void;
}

export const QuickReviewModal: React.FC<QuickReviewModalProps> = ({
  doc,
  onClose,
  onOpenFlashcards,
  onOpenQuiz,
}) => {
  if (!doc) return null;

  const points = makeQuickReview(doc.text, 5);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#19172D]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-review-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#E6E4F0] rounded-2xl max-w-2xl w-full p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#6A55DC] mb-1">Quick Review</p>
            <h2
              id="quick-review-title"
              className="text-xl font-bold text-[#211E36] truncate"
            >
              {doc.name}
            </h2>
            <p className="text-xs text-[#77758A] mt-1">
              Key sentences selected locally from your source text. Verify important details against your notes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#77758A] hover:bg-[#F4F3F8] hover:text-[#211E36]"
            aria-label="Close quick review"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-t border-[#EEEBF5] pt-4 space-y-3 max-h-[55vh] overflow-y-auto">
          {points.length > 0 ? (
            points.map((sentence, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#FAF9FD] border border-[#EEEBF5] text-sm text-[#2D2A42] leading-relaxed"
              >
                <span className="font-mono text-xs font-semibold text-[#6A55DC] mr-2">
                  0{idx + 1}.
                </span>
                {sentence}
              </div>
            ))
          ) : (
            <p className="text-sm text-[#77758A] py-4">
              There is not enough selectable text in this document to extract key sentences yet.
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[#EEEBF5] flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              onOpenFlashcards(doc.id);
              onClose();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2DEF2] bg-white text-sm font-semibold text-[#51469B] hover:bg-[#F8F6FF] whitespace-nowrap"
          >
            <Layers className="w-4 h-4" />
            Study Flashcards
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenQuiz(doc.id);
              onClose();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6A55DC] text-sm font-semibold text-white hover:bg-[#5B47C7] whitespace-nowrap"
          >
            <HelpCircle className="w-4 h-4" />
            Practice Quiz
          </button>
        </div>
      </div>
    </div>
  );
};
