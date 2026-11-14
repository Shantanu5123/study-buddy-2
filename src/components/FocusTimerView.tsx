import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipForward, Plus, Trash2, Check } from 'lucide-react';
import { RoomTask, StudyDocument } from '../types/study';
import { createId } from '../utils/textAnalysis';

interface FocusTimerViewProps {
  documents: StudyDocument[];
  todayMinutes: number;
  sessionsCount: number;
  onCompleteFocusBlock: (
    minutes: number,
    completedTasks: string[],
    sourceLabel: string
  ) => void;
  sessionTasks: RoomTask[];
  onUpdateSessionTasks: (tasks: RoomTask[]) => void;
  onToast: (msg: string, tone?: 'success' | 'info' | 'warn' | 'error') => void;
}

type TimerMode = 'focus' | 'short' | 'long';

const MODE_SECONDS: Record<TimerMode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus · 25 min',
  short: 'Short break · 5 min',
  long: 'Long break · 15 min',
};

function playChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Ignore audio context restrictions
  }
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  documents,
  todayMinutes,
  sessionsCount,
  onCompleteFocusBlock,
  sessionTasks,
  onUpdateSessionTasks,
  onToast,
}) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(MODE_SECONDS.focus);
  const [running, setRunning] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || '');
  const [taskDraft, setTaskDraft] = useState('');

  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running || secondsLeft > 0) return;
    setRunning(false);
    playChime();

    if (modeRef.current === 'focus') {
      const activeDoc = documents.find((d) => d.id === selectedDocId);
      const completed = sessionTasks.filter((t) => t.done).map((t) => t.text);
      onCompleteFocusBlock(
        25,
        completed,
        activeDoc ? `Focus Timer · ${activeDoc.name}` : 'Study Space Focus Timer'
      );
      onToast('Focus session complete. Take a 5-minute break.', 'success');
      setMode('short');
      setSecondsLeft(MODE_SECONDS.short);
    } else {
      onToast('Break complete. Ready for the next block.', 'info');
      setMode('focus');
      setSecondsLeft(MODE_SECONDS.focus);
    }
  }, [
    running,
    secondsLeft,
    documents,
    selectedDocId,
    sessionTasks,
    onCompleteFocusBlock,
    onToast,
  ]);

  const handleSwitchMode = (nextMode: TimerMode) => {
    setRunning(false);
    setMode(nextMode);
    setSecondsLeft(MODE_SECONDS[nextMode]);
  };

  const handleReset = () => {
    setRunning(false);
    setSecondsLeft(MODE_SECONDS[mode]);
  };

  const handleSkip = () => {
    setRunning(false);
    if (mode === 'focus') {
      handleSwitchMode('short');
    } else {
      handleSwitchMode('focus');
    }
  };

  const total = MODE_SECONDS[mode];
  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - secondsLeft / total);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDraft.trim()) return;
    onUpdateSessionTasks([
      ...sessionTasks,
      { id: createId('rt'), text: taskDraft.trim(), done: false },
    ]);
    setTaskDraft('');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#6A55DC] mb-1">One Thing at a Time</p>
        <h1 className="text-3xl font-extrabold text-[#211E36]">Focus Timer</h1>
        <p className="text-sm text-[#6E6B80] mt-1">
          Settle into a 25-minute Pomodoro sprint. Completing a block logs your streak and opens your session recap.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Timer Panel */}
        <div className="lg:col-span-7 bg-white border border-[#EAE8F2] rounded-2xl p-6 sm:p-8 flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-1 p-1 bg-[#F4F3F8] rounded-xl mb-8">
            {(['focus', 'short', 'long'] as TimerMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleSwitchMode(m)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  mode === m
                    ? 'bg-white text-[#211E36] shadow-xs'
                    : 'text-[#6E6B80] hover:text-[#211E36]'
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>

          <div className="relative w-56 h-56 flex items-center justify-center mb-6">
            <svg className="w-56 h-56 -rotate-90" viewBox="0 0 216 216">
              <circle
                cx="108"
                cy="108"
                r={radius}
                fill="none"
                stroke="#EEEBF7"
                strokeWidth="10"
              />
              <circle
                cx="108"
                cy="108"
                r={radius}
                fill="none"
                stroke={mode === 'focus' ? '#6A55DC' : '#0EA5E9'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-[stroke-dashoffset] duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold font-mono tabular-nums text-[#211E36]">
                {mins}:{secs}
              </span>
              <span className="text-xs font-semibold tracking-wider text-[#77758A] mt-2">
                {mode === 'focus'
                  ? 'FOCUS BLOCK'
                  : mode === 'short'
                    ? 'SHORT BREAK'
                    : 'LONG BREAK'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={handleReset}
              className="p-3 rounded-xl border border-[#E6E4F0] text-[#5E5A75] hover:bg-[#F8F6FF]"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#6A55DC] text-white text-sm font-bold hover:bg-[#5B47C7] shadow-sm"
            >
              {running ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Session
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Session
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="p-3 rounded-xl border border-[#E6E4F0] text-[#5E5A75] hover:bg-[#F8F6FF]"
              aria-label="Skip interval"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {documents.length > 0 && (
            <div className="w-full max-w-md pt-4 border-t border-[#F0EEF5]">
              <label
                htmlFor="focus-material-select"
                className="block text-xs font-semibold text-[#77758A] mb-1.5"
              >
                What are you working on?
              </label>
              <select
                id="focus-material-select"
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm text-[#211E36] focus:outline-none focus:border-[#6A55DC]"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Session Checklist & Daily Goal */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-[#EAE8F2] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#211E36]">Daily Focus Progress</h2>
              <span className="text-xs font-mono tabular-nums font-semibold text-[#6A55DC]">
                {todayMinutes} / 60 min
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#EEEBF7] overflow-hidden">
              <div
                className="h-full bg-[#6A55DC] rounded-full transition-all"
                style={{ width: `${Math.min(100, (todayMinutes / 60) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-[#77758A] font-mono tabular-nums">
              {sessionsCount} completed Pomodoro {sessionsCount === 1 ? 'sprint' : 'sprints'} logged
            </p>
          </div>

          <div className="bg-white border border-[#EAE8F2] rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#211E36]">Session Checklist</h2>
              <p className="text-xs text-[#77758A] mt-0.5">
                Pick 1–3 concrete tasks for this timer block.
              </p>
            </div>

            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={taskDraft}
                onChange={(e) => setTaskDraft(e.target.value)}
                placeholder="Add a focus task..."
                className="flex-1 px-3 py-2 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm text-[#211E36] focus:outline-none focus:border-[#6A55DC]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold hover:bg-[#5B47C7] shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {sessionTasks.length > 0 ? (
              <ul className="space-y-2">
                {sessionTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF9FD] border border-[#EEEBF5]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSessionTasks(
                          sessionTasks.map((t) =>
                            t.id === task.id ? { ...t, done: !t.done } : t
                          )
                        )
                      }
                      className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                    >
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                          task.done
                            ? 'bg-[#10B981] border-[#10B981] text-white'
                            : 'border-[#C9C6D9] bg-white'
                        }`}
                      >
                        {task.done && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <span
                        className={`text-sm truncate ${
                          task.done ? 'line-through text-[#8B889E]' : 'text-[#211E36]'
                        }`}
                      >
                        {task.text}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSessionTasks(
                          sessionTasks.filter((t) => t.id !== task.id)
                        )
                      }
                      className="p-1 text-[#8D899F] hover:text-[#DC2626]"
                      aria-label={`Remove ${task.text}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#8B889E] py-3 text-center">
                No session tasks yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
