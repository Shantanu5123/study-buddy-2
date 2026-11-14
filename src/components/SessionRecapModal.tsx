import React, { useState } from 'react';
import { Download, Flame, CheckCircle2, X } from 'lucide-react';
import { SessionRecapData, StudyDocument } from '../types/study';

interface SessionRecapModalProps {
  recap: SessionRecapData | null;
  streak: number;
  totalSessions: number;
  notes: StudyDocument[];
  onClose: () => void;
  onSaveReflectionNote?: (title: string, text: string) => void;
}

export const SessionRecapModal: React.FC<SessionRecapModalProps> = ({
  recap,
  streak,
  totalSessions,
  notes,
  onClose,
  onSaveReflectionNote,
}) => {
  const [reflection, setReflection] = useState('');

  if (!recap) return null;

  const handleDownloadMarkdown = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const completedList =
      recap.completedTasks.length > 0
        ? recap.completedTasks.map((t) => `- [x] ${t}`).join('\n')
        : '- No checklist tasks marked done during this block';

    const notesSection =
      notes.length > 0
        ? notes
            .slice(0, 5)
            .map((n) => `### ${n.name}\n\n${n.text}`)
            .join('\n\n---\n\n')
        : '_No saved study notes yet._';

    const mdContent = [
      `# StudyBuddy Session Recap (${dateStr})`,
      '',
      `- **Context:** ${recap.sourceLabel}`,
      `- **Focus Duration:** ${recap.durationMinutes} minutes`,
      `- **Total Completed Sessions:** ${totalSessions}`,
      `- **Current Daily Streak:** ${streak} ${streak === 1 ? 'day' : 'days'}`,
      '',
      '## Completed Tasks',
      completedList,
      '',
      '## Session Takeaways',
      reflection.trim() || '_No quick reflection added._',
      '',
      '## Recent Study Notes',
      notesSection,
      '',
    ].join('\n');

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studybuddy-session-${dateStr}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (reflection.trim() && onSaveReflectionNote) {
      onSaveReflectionNote(`Session Recap (${dateStr})`, reflection.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#19172D]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-recap-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#E6E4F0] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#6A55DC] mb-1">
              Focus Sprint Complete
            </p>
            <h2
              id="session-recap-title"
              className="text-xl font-extrabold text-[#211E36]"
            >
              Session Recap
            </h2>
            <p className="text-xs text-[#77758A] mt-0.5">{recap.sourceLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#77758A] hover:bg-[#F4F3F8]"
            aria-label="Close session recap"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[#FAF9FD] border border-[#EEEBF5]">
            <p className="text-[11px] text-[#77758A]">Completed</p>
            <p className="text-lg font-bold font-mono tabular-nums text-[#211E36] mt-0.5">
              {recap.durationMinutes} min
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF9FD] border border-[#EEEBF5]">
            <p className="text-[11px] text-[#77758A]">Total Sprints</p>
            <p className="text-lg font-bold font-mono tabular-nums text-[#211E36] mt-0.5">
              {totalSessions}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#F4F1FF] border border-[#E4DEFF]">
            <p className="text-[11px] text-[#5344B5] flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Streak
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-[#43388C] mt-0.5">
              {streak} {streak === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>

        {recap.completedTasks.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#5E5A75]">
              Tasks Completed
            </p>
            <ul className="space-y-1 max-h-28 overflow-y-auto">
              {recap.completedTasks.map((t, i) => (
                <li
                  key={i}
                  className="text-xs text-[#2D2A42] flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label
            htmlFor="session-reflection"
            className="block text-xs font-semibold text-[#5E5A75] mb-1.5"
          >
            Quick takeaway or note (included in .md export)
          </label>
          <textarea
            id="session-reflection"
            rows={3}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What clicked during this sprint? What will you review next?"
            className="w-full px-3.5 py-2 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm text-[#211E36] focus:outline-none focus:border-[#6A55DC]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-[#F0EEF5]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E6E4F0] text-sm font-semibold text-[#5E5A75] hover:bg-[#FAF9FD]"
          >
            Continue Studying
          </button>
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold hover:bg-[#5B47C7]"
          >
            <Download className="w-4 h-4" />
            Download Notes (.md)
          </button>
        </div>
      </div>
    </div>
  );
};
