import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Trash2,
} from 'lucide-react';
import {
  CardMasteryStatus,
  Flashcard,
  FlashcardDeck,
  StudyDocument,
} from '../types/study';
import { createId, makeFlashcardsFromText } from '../utils/textAnalysis';

interface FlashcardsViewProps {
  documents: StudyDocument[];
  selectedDocId: string;
  onSelectDoc: (docId: string) => void;
  cardsByDoc: Record<string, Flashcard[]>;
  onUpdateDocCards: (docId: string, cards: Flashcard[]) => void;
  decks: FlashcardDeck[];
  onUpdateDecks: (decks: FlashcardDeck[]) => void;
  onCardReviewed: () => void;
  onToast: (msg: string, tone?: 'success' | 'info' | 'warn' | 'error') => void;
}

function normalizeStatus(
  rating?: CardMasteryStatus | 'hard' | 'ok' | 'easy'
): CardMasteryStatus | null {
  if (!rating) return null;
  if (rating === 'review-again' || rating === 'hard') return 'review-again';
  return 'got-it';
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
  cardsByDoc,
  onUpdateDocCards,
  decks,
  onUpdateDecks,
  onCardReviewed,
  onToast,
}) => {
  const [mode, setMode] = useState<'materials' | 'decks'>('materials');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [onlyReviewAgain, setOnlyReviewAgain] = useState(false);

  // Custom deck study state
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [deckCardIdx, setDeckCardIdx] = useState(0);
  const [deckFlipped, setDeckFlipped] = useState(false);

  // Modal state for new deck / new card
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckCategory, setNewDeckCategory] = useState('General');
  const [addCardDeckId, setAddCardDeckId] = useState<string | null>(null);
  const [newCardQ, setNewCardQ] = useState('');
  const [newCardA, setNewCardA] = useState('');

  const textDocs = documents.filter((d) => d.text.trim().length > 0);
  const activeDoc = textDocs.find((d) => d.id === selectedDocId) || textDocs[0] || null;
  const allDocCards = activeDoc ? cardsByDoc[activeDoc.id] || [] : [];

  const docGotItCount = allDocCards.filter(
    (c) => normalizeStatus(c.rating) === 'got-it'
  ).length;
  const docReviewCount = allDocCards.filter(
    (c) => normalizeStatus(c.rating) === 'review-again'
  ).length;

  const visibleDocCards = onlyReviewAgain
    ? allDocCards.filter((c) => normalizeStatus(c.rating) === 'review-again')
    : allDocCards;

  const handleGenerateFromDoc = () => {
    if (!activeDoc) return;
    const generated = makeFlashcardsFromText(activeDoc.text, activeDoc.id);
    if (generated.length === 0) {
      onToast('This document needs a bit more text to generate cards.', 'warn');
      return;
    }
    onUpdateDocCards(activeDoc.id, generated);
    setCardIndex(0);
    setFlipped(false);
    setOnlyReviewAgain(false);
    onToast(`Created ${generated.length} practice cards from ${activeDoc.name}.`, 'success');
  };

  const handleFlipDocCard = () => {
    if (!flipped) onCardReviewed();
    setFlipped((prev) => !prev);
  };

  const handleRateDocCard = (rating: CardMasteryStatus) => {
    if (!activeDoc || visibleDocCards.length === 0) return;
    const currentCard = visibleDocCards[cardIndex % visibleDocCards.length];
    const updated = allDocCards.map((c) =>
      c.id === currentCard.id ? { ...c, rating } : c
    );
    onUpdateDocCards(activeDoc.id, updated);
    onCardReviewed();
    setFlipped(false);
    const nextVisible = onlyReviewAgain
      ? updated.filter((c) => normalizeStatus(c.rating) === 'review-again')
      : updated;
    if (nextVisible.length > 0) {
      setCardIndex((cardIndex + (onlyReviewAgain && rating === 'got-it' ? 0 : 1)) % nextVisible.length);
    } else {
      setCardIndex(0);
    }
  };

  const activeDeck = decks.find((d) => d.id === activeDeckId) || null;
  const deckGotItCount = activeDeck
    ? activeDeck.cards.filter((c) => normalizeStatus(c.rating) === 'got-it').length
    : 0;
  const deckReviewCount = activeDeck
    ? activeDeck.cards.filter((c) => normalizeStatus(c.rating) === 'review-again').length
    : 0;

  const visibleDeckCards = activeDeck
    ? onlyReviewAgain
      ? activeDeck.cards.filter((c) => normalizeStatus(c.rating) === 'review-again')
      : activeDeck.cards
    : [];

  const handleRateDeckCard = (rating: CardMasteryStatus) => {
    if (!activeDeck || visibleDeckCards.length === 0) return;
    const currentCard = visibleDeckCards[deckCardIdx % visibleDeckCards.length];
    const updatedDecks = decks.map((d) =>
      d.id === activeDeck.id
        ? {
            ...d,
            cards: d.cards.map((c) =>
              c.id === currentCard.id ? { ...c, rating } : c
            ),
          }
        : d
    );
    onUpdateDecks(updatedDecks);
    onCardReviewed();
    setDeckFlipped(false);
    const updatedActive = updatedDecks.find((d) => d.id === activeDeck.id);
    const nextVisible = updatedActive
      ? onlyReviewAgain
        ? updatedActive.cards.filter((c) => normalizeStatus(c.rating) === 'review-again')
        : updatedActive.cards
      : [];
    if (nextVisible.length > 0) {
      setDeckCardIdx((deckCardIdx + (onlyReviewAgain && rating === 'got-it' ? 0 : 1)) % nextVisible.length);
    } else {
      setDeckCardIdx(0);
    }
  };

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    const deck: FlashcardDeck = {
      id: createId('deck'),
      name: newDeckName.trim(),
      category: newDeckCategory.trim() || 'General',
      cards: [],
    };
    onUpdateDecks([deck, ...decks]);
    setNewDeckName('');
    setNewDeckCategory('General');
    setShowNewDeckModal(false);
    onToast(`Deck "${deck.name}" created.`, 'success');
  };

  const handleAddCardToDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCardDeckId || !newCardQ.trim() || !newCardA.trim()) return;
    const updated = decks.map((d) =>
      d.id === addCardDeckId
        ? {
            ...d,
            cards: [
              ...d.cards,
              { id: createId('card'), q: newCardQ.trim(), a: newCardA.trim() },
            ],
          }
        : d
    );
    onUpdateDecks(updated);
    setNewCardQ('');
    setNewCardA('');
    setAddCardDeckId(null);
    onToast('Card added to deck.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#6A55DC] mb-1">Spaced Repetition</p>
          <h1 className="text-3xl font-extrabold text-[#211E36]">Flashcards</h1>
          <p className="text-sm text-[#6E6B80] mt-1">
            Mark each card Got It or Review Again to track mastery and surface weak topics.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-[#E6E4F0] rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('materials');
              setOnlyReviewAgain(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              mode === 'materials'
                ? 'bg-[#6A55DC] text-white'
                : 'text-[#6E6B80] hover:text-[#211E36]'
            }`}
          >
            From Materials
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('decks');
              setOnlyReviewAgain(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              mode === 'decks'
                ? 'bg-[#6A55DC] text-white'
                : 'text-[#6E6B80] hover:text-[#211E36]'
            }`}
          >
            Custom Decks ({decks.length})
          </button>
        </div>
      </div>

      {mode === 'materials' ? (
        <div className="space-y-5">
          {activeDoc ? (
            <>
              <div className="bg-white border border-[#EAE8F2] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="flashcards-doc-select"
                    className="block text-xs font-semibold text-[#77758A] mb-1.5"
                  >
                    Source material
                  </label>
                  <select
                    id="flashcards-doc-select"
                    value={activeDoc.id}
                    onChange={(e) => {
                      onSelectDoc(e.target.value);
                      setCardIndex(0);
                      setFlipped(false);
                    }}
                    className="w-full max-w-md px-3.5 py-2 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm font-medium text-[#211E36] focus:outline-none focus:border-[#6A55DC]"
                  >
                    {textDocs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateFromDoc}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold hover:bg-[#5B47C7] whitespace-nowrap shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  {allDocCards.length > 0 ? 'Rebuild Deck' : 'Create Flashcards'}
                </button>
              </div>

              {allDocCards.length > 0 && (
                <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                    <span className="text-[#047857] font-semibold">
                      {docGotItCount} Got It
                    </span>
                    <span className="text-[#9A95B8]">·</span>
                    <span className="text-[#B45309] font-semibold">
                      {docReviewCount} Review Again
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOnlyReviewAgain((prev) => !prev);
                      setCardIndex(0);
                      setFlipped(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      onlyReviewAgain
                        ? 'border-[#F59E0B] bg-[#FFFBEB] text-[#92400E]'
                        : 'border-[#E6E4F0] bg-white text-[#5E5A75] hover:bg-[#FAF9FD]'
                    }`}
                  >
                    {onlyReviewAgain
                      ? 'Showing Review Again Only'
                      : `Filter: Review Again (${docReviewCount})`}
                  </button>
                </div>
              )}

              {visibleDocCards.length > 0 ? (
                <div className="max-w-2xl mx-auto space-y-5 pt-1">
                  {(() => {
                    const currentCard = visibleDocCards[cardIndex % visibleDocCards.length];
                    const status = normalizeStatus(currentCard.rating);
                    const progressPct = Math.round(
                      (((cardIndex % visibleDocCards.length) + 1) / visibleDocCards.length) *
                        100
                    );
                    return (
                      <>
                        {/* Deck Progress Bar */}
                        <div className="h-1.5 w-full rounded-full bg-[#E8E4F5] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#5F4DCC] to-[#8B79FA] transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        {/* 3D Flip Card with subtle deck stack */}
                        <div className="relative pt-1">
                          <div
                            aria-hidden="true"
                            className="absolute inset-x-4 -bottom-2 h-full rounded-2xl bg-[#EAE6F7] border border-[#DDD7F2]"
                          />
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={handleFlipDocCard}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault();
                                handleFlipDocCard();
                              }
                            }}
                            className="relative perspective-1200 h-76 cursor-pointer focus:outline-none"
                            aria-label="Flip flashcard"
                          >
                            <div
                              className={`relative w-full h-full preserve-3d transition-transform duration-500 ${
                                flipped ? 'rotate-y-180' : ''
                              }`}
                            >
                              {/* Front */}
                              <div className="absolute inset-0 backface-hidden surface-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                <span className="text-xs font-mono font-semibold text-[#6A55DC] mb-4">
                                  QUESTION · {(cardIndex % visibleDocCards.length) + 1} OF{' '}
                                  {visibleDocCards.length}
                                  {status === 'got-it'
                                    ? ' · GOT IT'
                                    : status === 'review-again'
                                      ? ' · REVIEW AGAIN'
                                      : ''}
                                </span>
                                <p className="text-xl sm:text-2xl font-display font-bold text-[#211E36] leading-snug max-w-lg text-balance">
                                  {currentCard.question}
                                </p>
                                <span className="mt-6 text-xs text-[#8B889E] inline-flex items-center gap-1.5">
                                  <RotateCw className="w-3.5 h-3.5" />
                                  Click card to reveal answer
                                </span>
                              </div>

                              {/* Back */}
                              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[#FAF9FF] to-[#F2EEFF] border border-[#C9C0F7] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-md">
                                <span className="text-xs font-mono font-semibold text-[#059669] mb-4">
                                  ANSWER · {(cardIndex % visibleDocCards.length) + 1} OF{' '}
                                  {visibleDocCards.length}
                                </span>
                                <p className="text-base sm:text-lg font-medium text-[#2D2A42] leading-relaxed max-w-lg">
                                  {currentCard.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setFlipped(false);
                                setCardIndex(
                                  (cardIndex - 1 + visibleDocCards.length) %
                                    visibleDocCards.length
                                );
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E6E4F0] bg-white text-sm font-semibold text-[#3D3956] hover:bg-[#F8F6FF]"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              Previous
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFlipped(false);
                                setCardIndex((cardIndex + 1) % visibleDocCards.length);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E6E4F0] bg-white text-sm font-semibold text-[#3D3956] hover:bg-[#F8F6FF]"
                            >
                              Next
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRateDocCard('review-again')}
                              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                                status === 'review-again'
                                  ? 'border-[#F59E0B] bg-[#FEF3C7] text-[#92400E]'
                                  : 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309] hover:bg-[#FEF3C7]'
                              }`}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Review Again
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRateDocCard('got-it')}
                              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                                status === 'got-it'
                                  ? 'border-[#10B981] bg-[#D1FAE5] text-[#065F46]'
                                  : 'border-[#A7F3D0] bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5]'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Got It
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : allDocCards.length > 0 && onlyReviewAgain ? (
                <div className="bg-white border border-[#EAE8F2] rounded-2xl p-10 text-center max-w-2xl mx-auto">
                  <p className="text-sm font-semibold text-[#211E36]">
                    No cards remaining in Review Again for this document.
                  </p>
                  <button
                    type="button"
                    onClick={() => setOnlyReviewAgain(false)}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-xs font-semibold"
                  >
                    Show All Cards
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-[#EAE8F2] rounded-2xl p-10 text-center">
                  <p className="text-sm font-semibold text-[#211E36]">
                    No flashcards created for this document yet.
                  </p>
                  <p className="text-xs text-[#77758A] mt-1">
                    Click “Create Flashcards” above to draft a study deck from your notes.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-[#EAE8F2] rounded-2xl p-10 text-center">
              <p className="text-sm font-semibold text-[#211E36]">
                Add a text-based document in My Library or write a note first.
              </p>
              <p className="text-xs text-[#77758A] mt-1">
                Or switch to “Custom Decks” above to review built-in study decks.
              </p>
            </div>
          )}
        </div>
      ) : activeDeck ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                setActiveDeckId(null);
                setDeckFlipped(false);
                setDeckCardIdx(0);
                setOnlyReviewAgain(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E6E4F0] bg-white text-sm font-semibold text-[#3D3956] hover:bg-[#F8F6FF]"
            >
              <ChevronLeft className="w-4 h-4" />
              All Decks
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-xs font-mono tabular-nums">
                <span className="text-[#047857] font-semibold">
                  {deckGotItCount} Got It
                </span>
                <span className="mx-1.5 text-[#9A95B8]">·</span>
                <span className="text-[#B45309] font-semibold">
                  {deckReviewCount} Review Again
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOnlyReviewAgain((p) => !p);
                  setDeckCardIdx(0);
                  setDeckFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  onlyReviewAgain
                    ? 'border-[#F59E0B] bg-[#FFFBEB] text-[#92400E]'
                    : 'border-[#E6E4F0] bg-white text-[#5E5A75]'
                }`}
              >
                {onlyReviewAgain ? 'All Cards' : `Review Again (${deckReviewCount})`}
              </button>
              <div className="text-right">
                <p className="text-sm font-bold text-[#211E36]">{activeDeck.name}</p>
                <p className="text-xs text-[#77758A]">
                  {activeDeck.category} · {activeDeck.cards.length} cards
                </p>
              </div>
            </div>
          </div>

          {visibleDeckCards.length > 0 ? (
            <div className="max-w-2xl mx-auto space-y-5">
              {(() => {
                const current = visibleDeckCards[deckCardIdx % visibleDeckCards.length];
                const status = normalizeStatus(current.rating);
                return (
                  <>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (!deckFlipped) onCardReviewed();
                        setDeckFlipped((prev) => !prev);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          if (!deckFlipped) onCardReviewed();
                          setDeckFlipped((prev) => !prev);
                        }
                      }}
                      className="perspective-1200 h-72 cursor-pointer focus:outline-none"
                    >
                      <div
                        className={`relative w-full h-full preserve-3d transition-transform duration-500 ${
                          deckFlipped ? 'rotate-y-180' : ''
                        }`}
                      >
                        <div className="absolute inset-0 backface-hidden bg-white border border-[#E4E0F5] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                          <span className="text-xs font-mono font-semibold text-[#6A55DC] mb-4">
                            QUESTION · {(deckCardIdx % visibleDeckCards.length) + 1} OF{' '}
                            {visibleDeckCards.length}
                            {status === 'got-it'
                              ? ' · GOT IT'
                              : status === 'review-again'
                                ? ' · REVIEW AGAIN'
                                : ''}
                          </span>
                          <p className="text-xl font-display font-bold text-[#211E36] leading-snug max-w-lg">
                            {current.q}
                          </p>
                          <span className="mt-6 text-xs text-[#8B889E] inline-flex items-center gap-1.5">
                            <RotateCw className="w-3.5 h-3.5" />
                            Click card to flip
                          </span>
                        </div>
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#FAF9FF] border border-[#C9C0F7] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                          <span className="text-xs font-mono font-semibold text-[#059669] mb-4">
                            ANSWER · {(deckCardIdx % visibleDeckCards.length) + 1} OF{' '}
                            {visibleDeckCards.length}
                          </span>
                          <p className="text-base font-medium text-[#2D2A42] leading-relaxed max-w-lg">
                            {current.a}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDeckFlipped(false);
                            setDeckCardIdx(
                              (deckCardIdx - 1 + visibleDeckCards.length) %
                                visibleDeckCards.length
                            );
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E6E4F0] bg-white text-sm font-semibold text-[#3D3956] hover:bg-[#F8F6FF]"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeckFlipped(false);
                            setDeckCardIdx((deckCardIdx + 1) % visibleDeckCards.length);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E6E4F0] bg-white text-sm font-semibold text-[#3D3956] hover:bg-[#F8F6FF]"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRateDeckCard('review-again')}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold ${
                            status === 'review-again'
                              ? 'border-[#F59E0B] bg-[#FEF3C7] text-[#92400E]'
                              : 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309] hover:bg-[#FEF3C7]'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Review Again
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRateDeckCard('got-it')}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold ${
                            status === 'got-it'
                              ? 'border-[#10B981] bg-[#D1FAE5] text-[#065F46]'
                              : 'border-[#A7F3D0] bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5]'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Got It
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white border border-[#EAE8F2] rounded-2xl p-10 text-center">
              <p className="text-sm font-semibold text-[#211E36]">
                {activeDeck.cards.length === 0
                  ? 'This deck has no cards yet.'
                  : 'All cards in this deck are marked Got It.'}
              </p>
              {activeDeck.cards.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setAddCardDeckId(activeDeck.id)}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Add First Card
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setOnlyReviewAgain(false)}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-xs font-semibold"
                >
                  Show All Cards
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowNewDeckModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold hover:bg-[#5B47C7] whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              New Deck
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => {
              const gotCount = deck.cards.filter(
                (c) => normalizeStatus(c.rating) === 'got-it'
              ).length;
              const revCount = deck.cards.filter(
                (c) => normalizeStatus(c.rating) === 'review-again'
              ).length;
              return (
                <div
                  key={deck.id}
                  className="bg-white border border-[#EAE8F2] rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <p className="text-xs text-[#77758A]">
                      {deck.category} · {deck.cards.length} cards
                    </p>
                    <h3 className="text-lg font-bold text-[#211E36] mt-1">{deck.name}</h3>
                    {(gotCount > 0 || revCount > 0) && (
                      <p className="text-xs font-mono tabular-nums mt-1.5 text-[#5E5A75]">
                        {gotCount} got it · {revCount} review again
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDeckId(deck.id);
                        setDeckCardIdx(0);
                        setDeckFlipped(false);
                        setOnlyReviewAgain(false);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#6A55DC] text-white text-xs font-semibold hover:bg-[#5B47C7] whitespace-nowrap"
                    >
                      Study Deck
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddCardDeckId(deck.id)}
                      className="px-3 py-2 rounded-xl border border-[#E6E4F0] text-xs font-semibold text-[#4E4396] hover:bg-[#F8F6FF] whitespace-nowrap"
                    >
                      Add Card
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateDecks(decks.filter((d) => d.id !== deck.id));
                        onToast(`Removed "${deck.name}".`, 'info');
                      }}
                      className="p-2 rounded-xl text-[#8D899F] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                      aria-label={`Delete ${deck.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Deck Modal */}
      {showNewDeckModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#19172D]/50 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewDeckModal(false);
          }}
        >
          <form
            onSubmit={handleCreateDeck}
            className="bg-white border border-[#E6E4F0] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl"
          >
            <h2 className="text-lg font-bold text-[#211E36]">Create New Deck</h2>
            <div>
              <label className="block text-xs font-semibold text-[#5E5A75] mb-1">
                Deck Name
              </label>
              <input
                type="text"
                required
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="e.g. Organic Chemistry Mechanisms"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E4F0] text-sm focus:outline-none focus:border-[#6A55DC]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5E5A75] mb-1">
                Subject / Category
              </label>
              <input
                type="text"
                value={newDeckCategory}
                onChange={(e) => setNewDeckCategory(e.target.value)}
                placeholder="e.g. Chemistry"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E4F0] text-sm focus:outline-none focus:border-[#6A55DC]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewDeckModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E6E4F0] text-sm font-semibold text-[#5E5A75]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold"
              >
                Create Deck
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Card Modal */}
      {addCardDeckId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#19172D]/50 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAddCardDeckId(null);
          }}
        >
          <form
            onSubmit={handleAddCardToDeck}
            className="bg-white border border-[#E6E4F0] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl"
          >
            <h2 className="text-lg font-bold text-[#211E36]">Add Flashcard</h2>
            <div>
              <label className="block text-xs font-semibold text-[#5E5A75] mb-1">
                Question / Prompt
              </label>
              <textarea
                required
                rows={3}
                value={newCardQ}
                onChange={(e) => setNewCardQ(e.target.value)}
                placeholder="Enter the question or term..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E4F0] text-sm focus:outline-none focus:border-[#6A55DC]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5E5A75] mb-1">
                Answer / Definition
              </label>
              <textarea
                required
                rows={3}
                value={newCardA}
                onChange={(e) => setNewCardA(e.target.value)}
                placeholder="Enter the answer..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E4F0] text-sm focus:outline-none focus:border-[#6A55DC]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddCardDeckId(null)}
                className="px-4 py-2 rounded-xl border border-[#E6E4F0] text-sm font-semibold text-[#5E5A75]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold"
              >
                Save Card
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
