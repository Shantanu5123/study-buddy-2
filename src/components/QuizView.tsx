import React, { useState } from 'react';
import { Bot, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { SUBJECT_QUIZ_BANKS } from '../data/seedData';
import {
  MaterialQuizQuestion,
  MissedQuizQuestion,
  StudyDocument,
  TutorLaunchContext,
} from '../types/study';
import { makeQuizFromText } from '../utils/textAnalysis';

interface QuizViewProps {
  documents: StudyDocument[];
  selectedDocId: string;
  onSelectDoc: (docId: string) => void;
  onQuizCompleted: (pct: number) => void;
  onRecordMissedQuestion: (
    missed: Omit<MissedQuizQuestion, 'id' | 'createdAt'>
  ) => void;
  onOpenTutor: (ctx: TutorLaunchContext) => void;
  onToast: (msg: string, tone?: 'success' | 'info' | 'warn' | 'error') => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
  onQuizCompleted,
  onRecordMissedQuestion,
  onOpenTutor,
  onToast,
}) => {
  const [mode, setMode] = useState<'material' | 'subjects'>('material');

  // Material quiz state
  const [matQuestions, setMatQuestions] = useState<MaterialQuizQuestion[]>([]);
  const [matIdx, setMatIdx] = useState(0);
  const [matSelected, setMatSelected] = useState<string>('');
  const [matChecked, setMatChecked] = useState(false);
  const [matScore, setMatScore] = useState(0);

  // Subject quiz state
  const [selectedSubject, setSelectedSubject] = useState<string>('math');
  const [subRunning, setSubRunning] = useState(false);
  const [subIdx, setSubIdx] = useState(0);
  const [subSelected, setSubSelected] = useState<number | null>(null);
  const [subScore, setSubScore] = useState(0);
  const [subFinished, setSubFinished] = useState(false);

  const textDocs = documents.filter((d) => d.text.trim().length > 0);
  const activeDoc = textDocs.find((d) => d.id === selectedDocId) || textDocs[0] || null;

  const handleStartMaterialQuiz = () => {
    if (!activeDoc) return;
    const qs = makeQuizFromText(activeDoc.text);
    if (qs.length === 0) {
      onToast('This document needs a little more selectable text to create a quiz.', 'warn');
      return;
    }
    setMatQuestions(qs);
    setMatIdx(0);
    setMatSelected('');
    setMatChecked(false);
    setMatScore(0);
  };

  const handleCheckMat = () => {
    if (!matSelected || !activeDoc) return;
    const current = matQuestions[matIdx];
    const correct =
      matSelected.toLowerCase() === current.answer.toLowerCase();
    if (correct) {
      setMatScore((s) => s + 1);
    } else {
      onRecordMissedQuestion({
        docId: activeDoc.id,
        sourceName: activeDoc.name,
        prompt: current.prompt,
        chosenAnswer: matSelected,
        correctAnswer: current.answer,
      });
    }
    setMatChecked(true);
  };

  const handleNextMat = () => {
    if (matIdx + 1 >= matQuestions.length) {
      const pct = Math.round((matScore / matQuestions.length) * 100);
      onQuizCompleted(pct);
    }
    setMatIdx((i) => i + 1);
    setMatSelected('');
    setMatChecked(false);
  };

  const subjectBank = SUBJECT_QUIZ_BANKS[selectedSubject];
  const subjectQuestions = subjectBank.questions;

  const handleStartSubjectQuiz = () => {
    setSubRunning(true);
    setSubIdx(0);
    setSubSelected(null);
    setSubScore(0);
    setSubFinished(false);
  };

  const handlePickSubjectOption = (optIdx: number) => {
    if (subSelected !== null) return;
    setSubSelected(optIdx);
    const current = subjectQuestions[subIdx];
    if (optIdx === current.ans) {
      setSubScore((s) => s + 1);
    } else {
      onRecordMissedQuestion({
        docId: activeDoc?.id,
        sourceName: `${subjectBank.label} Quiz`,
        prompt: current.q,
        chosenAnswer: current.opts[optIdx],
        correctAnswer: current.opts[current.ans],
        explanation: current.exp,
      });
    }
  };

  const handleNextSubjectQuestion = () => {
    if (subIdx + 1 >= subjectQuestions.length) {
      const pct = Math.round((subScore / subjectQuestions.length) * 100);
      onQuizCompleted(pct);
      setSubFinished(true);
    } else {
      setSubIdx((i) => i + 1);
      setSubSelected(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#6A55DC] mb-1">Check What Stuck</p>
          <h1 className="text-3xl font-extrabold text-[#211E36]">Practice Quiz</h1>
          <p className="text-sm text-[#6E6B80] mt-1">
            Test your recall from your study files or subject banks, and ask the AI Tutor whenever you miss a question.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              onOpenTutor({
                documentTitle: activeDoc?.name || `${subjectBank.label} Practice`,
                documentText: activeDoc?.text || '',
              })
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DFD8FA] bg-[#F4F1FF] text-xs font-semibold text-[#4E4396] hover:bg-[#EAE4FF] whitespace-nowrap"
          >
            <Bot className="w-3.5 h-3.5 text-[#6A55DC]" />
            Ask AI Tutor
          </button>

          <div className="flex items-center gap-1 p-1 bg-white border border-[#E6E4F0] rounded-xl">
            <button
              type="button"
              onClick={() => setMode('material')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'material'
                  ? 'bg-[#6A55DC] text-white'
                  : 'text-[#6E6B80] hover:text-[#211E36]'
              }`}
            >
              From Your Material
            </button>
            <button
              type="button"
              onClick={() => setMode('subjects')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'subjects'
                  ? 'bg-[#6A55DC] text-white'
                  : 'text-[#6E6B80] hover:text-[#211E36]'
              }`}
            >
              Subject Practice
            </button>
          </div>
        </div>
      </div>

      {mode === 'material' ? (
        activeDoc ? (
          <div className="space-y-5">
            <div className="bg-white border border-[#EAE8F2] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="quiz-doc-select"
                  className="block text-xs font-semibold text-[#77758A] mb-1.5"
                >
                  Source material
                </label>
                <select
                  id="quiz-doc-select"
                  value={activeDoc.id}
                  onChange={(e) => {
                    onSelectDoc(e.target.value);
                    setMatQuestions([]);
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
                onClick={handleStartMaterialQuiz}
                className="px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold hover:bg-[#5B47C7] whitespace-nowrap shrink-0"
              >
                {matQuestions.length > 0 ? 'Rebuild Quiz' : 'Create Practice Quiz'}
              </button>
            </div>

            {matQuestions.length > 0 && (
              <div className="max-w-2xl mx-auto">
                {matIdx >= matQuestions.length ? (
                  <div className="bg-white border border-[#EAE8F2] rounded-2xl p-8 text-center space-y-3">
                    <p className="text-xs font-semibold text-[#6A55DC]">Quiz Complete</p>
                    <p className="text-4xl font-extrabold font-mono tabular-nums text-[#211E36]">
                      {matScore} / {matQuestions.length}
                    </p>
                    <p className="text-sm text-[#6E6B80]">
                      Any missed questions are saved in your Study Space Overview under Needs Review.
                    </p>
                    <button
                      type="button"
                      onClick={handleStartMaterialQuiz}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Try Another Set
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-[#EAE8F2] rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between text-xs font-mono text-[#77758A] tabular-nums">
                      <span>
                        QUESTION {matIdx + 1} OF {matQuestions.length}
                      </span>
                      <span>{matScore} CORRECT SO FAR</span>
                    </div>

                    <p className="text-base font-semibold text-[#211E36] leading-relaxed">
                      {matQuestions[matIdx].prompt}
                    </p>

                    <div className="space-y-2.5">
                      {matQuestions[matIdx].options.map((opt) => {
                        const isPicked = matSelected === opt;
                        const isAnswer =
                          opt.toLowerCase() ===
                          matQuestions[matIdx].answer.toLowerCase();
                        let style =
                          'border-[#E6E4F0] bg-[#FAF9FD] text-[#211E36] hover:border-[#6A55DC]/50';
                        if (matChecked) {
                          if (isAnswer) {
                            style = 'border-[#10B981] bg-[#ECFDF5] text-[#065F46]';
                          } else if (isPicked) {
                            style = 'border-[#EF4444] bg-[#FEF2F2] text-[#991B1B]';
                          }
                        } else if (isPicked) {
                          style = 'border-[#6A55DC] bg-[#F3F0FF] text-[#43388C]';
                        }

                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={matChecked}
                            onClick={() => setMatSelected(opt)}
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors flex items-center justify-between ${style}`}
                          >
                            <span>{opt}</span>
                            {matChecked && isAnswer && (
                              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                            )}
                            {matChecked && isPicked && !isAnswer && (
                              <XCircle className="w-4 h-4 text-[#DC2626]" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {matChecked &&
                      matSelected.toLowerCase() !==
                        matQuestions[matIdx].answer.toLowerCase() && (
                        <div className="p-3.5 rounded-xl bg-[#F4F1FF] border border-[#E4DEFF] flex flex-wrap items-center justify-between gap-3">
                          <span className="text-xs text-[#3E357A]">
                            Want a deeper breakdown grounded in {activeDoc.name}?
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onOpenTutor({
                                documentTitle: activeDoc.name,
                                documentText: activeDoc.text,
                                missedQuestion: {
                                  prompt: matQuestions[matIdx].prompt,
                                  chosenAnswer: matSelected,
                                  correctAnswer: matQuestions[matIdx].answer,
                                },
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6A55DC] text-white text-xs font-semibold hover:bg-[#5B47C7]"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            Explain why I missed this
                          </button>
                        </div>
                      )}

                    <div className="flex justify-end pt-2">
                      {!matChecked ? (
                        <button
                          type="button"
                          disabled={!matSelected}
                          onClick={handleCheckMat}
                          className="px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold disabled:opacity-50"
                        >
                          Check Answer
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNextMat}
                          className="px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold"
                        >
                          {matIdx + 1 >= matQuestions.length
                            ? 'Finish Quiz'
                            : 'Next Question'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-[#EAE8F2] rounded-2xl p-10 text-center">
            <p className="text-sm font-semibold text-[#211E36]">
              Add a text-based document in My Library first, or switch to Subject Practice.
            </p>
          </div>
        )
      ) : !subRunning ? (
        <div className="bg-white border border-[#EAE8F2] rounded-2xl p-6 max-w-3xl">
          <h2 className="text-lg font-bold text-[#211E36] mb-1">Choose a Subject</h2>
          <p className="text-xs text-[#77758A] mb-5">
            Instant multiple-choice practice with explanations for every question.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {Object.entries(SUBJECT_QUIZ_BANKS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedSubject(key)}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  selectedSubject === key
                    ? 'border-[#6A55DC] bg-[#F4F1FF] text-[#3F3388]'
                    : 'border-[#E6E4F0] bg-[#FAF9FD] text-[#211E36] hover:border-[#6A55DC]/40'
                }`}
              >
                <p className="text-sm font-bold">{item.label}</p>
                <p className="text-xs text-[#77758A] font-mono mt-1">
                  {item.questions.length} questions
                </p>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleStartSubjectQuiz}
            className="px-5 py-2.5 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold hover:bg-[#5B47C7]"
          >
            Start {subjectBank.label} Quiz
          </button>
        </div>
      ) : subFinished ? (
        <div className="bg-white border border-[#EAE8F2] rounded-2xl p-8 max-w-xl mx-auto text-center space-y-4">
          <p className="text-xs font-semibold text-[#6A55DC]">
            {subjectBank.label} Complete
          </p>
          <p className="text-4xl font-extrabold font-mono tabular-nums text-[#211E36]">
            {subScore} / {subjectQuestions.length}
          </p>
          <p className="text-sm text-[#6E6B80]">
            Accuracy: {Math.round((subScore / subjectQuestions.length) * 100)}%
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleStartSubjectQuiz}
              className="px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold"
            >
              Retry Quiz
            </button>
            <button
              type="button"
              onClick={() => setSubRunning(false)}
              className="px-4 py-2 rounded-xl border border-[#E6E4F0] text-sm font-semibold text-[#3D3956]"
            >
              Change Subject
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white border border-[#EAE8F2] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between text-xs font-mono tabular-nums text-[#77758A]">
            <span>
              {subjectBank.label.toUpperCase()} · {subIdx + 1} / {subjectQuestions.length}
            </span>
            <span>SCORE: {subScore}</span>
          </div>

          <div className="h-1.5 w-full bg-[#EEEBF7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6A55DC] transition-all"
              style={{ width: `${((subIdx + 1) / subjectQuestions.length) * 100}%` }}
            />
          </div>

          <p className="text-lg font-display font-bold text-[#211E36]">
            {subjectQuestions[subIdx].q}
          </p>

          <div className="space-y-2.5">
            {subjectQuestions[subIdx].opts.map((opt, idx) => {
              const isAnswer = idx === subjectQuestions[subIdx].ans;
              const isPicked = subSelected === idx;
              let cls =
                'border-[#E6E4F0] bg-[#FAF9FD] text-[#211E36] hover:border-[#6A55DC]/50';
              if (subSelected !== null) {
                if (isAnswer) cls = 'border-[#10B981] bg-[#ECFDF5] text-[#065F46]';
                else if (isPicked) cls = 'border-[#EF4444] bg-[#FEF2F2] text-[#991B1B]';
              }
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={subSelected !== null}
                  onClick={() => handlePickSubjectOption(idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors flex items-center justify-between ${cls}`}
                >
                  <span>
                    <span className="font-mono text-xs mr-2.5 opacity-70">
                      {['A', 'B', 'C', 'D'][idx]}.
                    </span>
                    {opt}
                  </span>
                  {subSelected !== null && isAnswer && (
                    <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  )}
                  {subSelected !== null && isPicked && !isAnswer && (
                    <XCircle className="w-4 h-4 text-[#DC2626]" />
                  )}
                </button>
              );
            })}
          </div>

          {subSelected !== null && (
            <div className="p-3.5 rounded-xl bg-[#F4F1FF] border border-[#E4DEFF] text-xs text-[#3E357A] leading-relaxed space-y-2.5">
              <p>{subjectQuestions[subIdx].exp}</p>
              {subSelected !== subjectQuestions[subIdx].ans && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenTutor({
                      documentTitle: activeDoc?.name || `${subjectBank.label} Practice`,
                      documentText: activeDoc?.text || '',
                      missedQuestion: {
                        prompt: subjectQuestions[subIdx].q,
                        chosenAnswer: subjectQuestions[subIdx].opts[subSelected],
                        correctAnswer:
                          subjectQuestions[subIdx].opts[subjectQuestions[subIdx].ans],
                        explanation: subjectQuestions[subIdx].exp,
                      },
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6A55DC] text-white text-xs font-semibold hover:bg-[#5B47C7]"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Explain why I missed this
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setSubRunning(false)}
              className="px-3.5 py-2 rounded-xl border border-[#E6E4F0] text-xs font-semibold text-[#5E5A75]"
            >
              Quit
            </button>
            <button
              type="button"
              disabled={subSelected === null}
              onClick={handleNextSubjectQuestion}
              className="px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold disabled:opacity-50"
            >
              {subIdx + 1 >= subjectQuestions.length ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
