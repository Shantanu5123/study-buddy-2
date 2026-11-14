import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  DoorOpen,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Send,
  Settings,
  SkipForward,
  Trash2,
} from 'lucide-react';
import { BUDDY_PROFILES, buildBuddyGreeting } from '../data/seedData';
import { RoomMessage, RoomTask, StudyBuddyProfile, UserProfile } from '../types/study';
import { createId } from '../utils/textAnalysis';
import { AvatarMonogram } from './AvatarMonogram';

interface StudyRoomViewProps {
  buddy: StudyBuddyProfile | null;
  profile: UserProfile | null;
  roomTasks: RoomTask[];
  onUpdateRoomTasks: (tasks: RoomTask[]) => void;
  onSelectBuddy: (buddy: StudyBuddyProfile) => void;
  onCompleteFocusBlock: (
    minutes: number,
    completedTasks: string[],
    sourceLabel: string
  ) => void;
  onLeaveRoom: () => void;
  onToast: (msg: string, tone?: 'success' | 'info' | 'warn' | 'error') => void;
}

type Phase = 'focus' | 'shortBreak' | 'longBreak';

export const StudyRoomView: React.FC<StudyRoomViewProps> = ({
  buddy,
  profile,
  roomTasks,
  onUpdateRoomTasks,
  onSelectBuddy,
  onCompleteFocusBlock,
  onLeaveRoom,
  onToast,
}) => {
  const activeBuddy = buddy || BUDDY_PROFILES[0];
  const myName = profile?.name || 'You';

  // Timer settings & state
  const [focusMins, setFocusMins] = useState(25);
  const [shortBreakMins, setShortBreakMins] = useState(5);
  const [longBreakMins, setLongBreakMins] = useState(15);
  const [showSettings, setShowSettings] = useState(false);

  const [phase, setPhase] = useState<Phase>('focus');
  const [sessionNum, setSessionNum] = useState(1);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  // Tasks state
  const [taskInput, setTaskInput] = useState('');

  // Chat state
  const [messages, setMessages] = useState<RoomMessage[]>(() => [
    {
      id: createId('msg'),
      sender: 'buddy',
      author: activeBuddy.name,
      text: buildBuddyGreeting(activeBuddy, profile),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [buddyTyping, setBuddyTyping] = useState(false);
  const replyCountRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    replyCountRef.current = 0;
    setMessages([
      {
        id: createId('msg'),
        sender: 'buddy',
        author: activeBuddy.name,
        text: buildBuddyGreeting(activeBuddy, profile),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [activeBuddy, profile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, buddyTyping]);

  const phaseDuration = (p: Phase) =>
    p === 'focus' ? focusMins * 60 : p === 'shortBreak' ? shortBreakMins * 60 : longBreakMins * 60;

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
    if (phase === 'focus') {
      const completed = roomTasks.filter((t) => t.done).map((t) => t.text);
      onCompleteFocusBlock(focusMins, completed, `Study Room with ${activeBuddy.name}`);
      const nextPhase: Phase = sessionNum >= 4 ? 'longBreak' : 'shortBreak';
      setPhase(nextPhase);
      setSecondsLeft(
        nextPhase === 'shortBreak' ? shortBreakMins * 60 : longBreakMins * 60
      );
      onToast('Focus block complete. Time for a break.', 'success');
    } else {
      const nextNum = sessionNum >= 4 ? 1 : sessionNum + 1;
      setSessionNum(nextNum);
      setPhase('focus');
      setSecondsLeft(focusMins * 60);
      onToast('Break complete. Starting next focus block.', 'info');
    }
  }, [
    running,
    secondsLeft,
    phase,
    sessionNum,
    focusMins,
    shortBreakMins,
    longBreakMins,
    roomTasks,
    activeBuddy.name,
    onCompleteFocusBlock,
    onToast,
  ]);

  const handleReset = () => {
    setRunning(false);
    setSecondsLeft(phaseDuration(phase));
  };

  const handleSkip = () => {
    setRunning(false);
    if (phase === 'focus') {
      const nextPhase: Phase = sessionNum >= 4 ? 'longBreak' : 'shortBreak';
      setPhase(nextPhase);
      setSecondsLeft(phaseDuration(nextPhase));
    } else {
      setSessionNum((n) => (n >= 4 ? 1 : n + 1));
      setPhase('focus');
      setSecondsLeft(focusMins * 60);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    onUpdateRoomTasks([
      ...roomTasks,
      { id: createId('rt'), text: taskInput.trim(), done: false },
    ]);
    setTaskInput('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const myMsg: RoomMessage = {
      id: createId('msg'),
      sender: 'me',
      author: myName,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, myMsg]);
    setChatInput('');

    const contextualReplies = [
      `Locked in for ${activeBuddy.examTarget} prep — let’s keep this ${activeBuddy.subjects[0] || 'study'} block focused.`,
      `How is your current task coming along? I’m pushing through ${activeBuddy.shortGoal}.`,
      `Nice progress. Let’s check back in once this ${focusMins}-minute sprint wraps up.`,
      `Remember to stretch and review what stuck during our break!`,
    ];

    setBuddyTyping(true);
    window.setTimeout(() => {
      setBuddyTyping(false);
      const replyText =
        contextualReplies[replyCountRef.current % contextualReplies.length];
      replyCountRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: createId('msg'),
          sender: 'buddy',
          author: activeBuddy.name,
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 850);
  };

  const total = phaseDuration(phase);
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - secondsLeft / Math.max(1, total));
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-6 space-y-5">
      {/* Room Header */}
      <div className="surface-card rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <AvatarMonogram
            name={activeBuddy.name}
            color={activeBuddy.avatarColor}
            size="md"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-extrabold text-[#211E36] truncate">
                Studying with {activeBuddy.name}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-[#F4F1FF] border border-[#DFD8FA] text-[11px] font-bold text-[#6A55DC]">
                {activeBuddy.examTarget}
              </span>
            </div>
            <p className="text-xs text-[#77758A] mt-0.5">
              {activeBuddy.subjects.join(' · ')} · {activeBuddy.timezone} ·{' '}
              {activeBuddy.online ? 'Online' : 'Session Ready'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <select
            aria-label="Switch study buddy"
            value={activeBuddy.id}
            onChange={(e) => {
              const found = BUDDY_PROFILES.find((b) => b.id === e.target.value);
              if (found) onSelectBuddy(found);
            }}
            className="px-3 py-2 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-xs font-semibold text-[#3D3956] focus:outline-none focus:border-[#6A55DC]"
          >
            {BUDDY_PROFILES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.examTarget})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onLeaveRoom}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] whitespace-nowrap"
          >
            <DoorOpen className="w-4 h-4" />
            Leave Room
          </button>
        </div>
      </div>

      {/* 3-Column Study Room */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Tasks */}
        <div className="lg:col-span-4 surface-card rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#211E36]">Session Tasks</h2>
            <span className="text-xs font-mono tabular-nums text-[#77758A]">
              {roomTasks.filter((t) => t.done).length} / {roomTasks.length} done
            </span>
          </div>

          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Add a session task..."
              className="flex-1 px-3 py-2 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm focus:outline-none focus:border-[#6A55DC]"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold hover:bg-[#5B47C7]"
              aria-label="Add task"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <ul className="space-y-2 flex-1 overflow-y-auto max-h-80">
            {roomTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF9FD] border border-[#EEEBF5]"
              >
                <button
                  type="button"
                  onClick={() =>
                    onUpdateRoomTasks(
                      roomTasks.map((t) =>
                        t.id === task.id ? { ...t, done: !t.done } : t
                      )
                    )
                  }
                  className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                >
                  <span
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                      task.done
                        ? 'bg-[#10B981] border-[#10B981] text-white'
                        : 'border-[#C9C6D9] bg-white'
                    }`}
                  >
                    {task.done && <Check className="w-3 h-3" />}
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
                    onUpdateRoomTasks(roomTasks.filter((t) => t.id !== task.id))
                  }
                  className="p-1 text-[#8D899F] hover:text-[#DC2626]"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
            {roomTasks.length === 0 && (
              <p className="text-xs text-[#8B889E] text-center py-6">
                Add a task to track what you want to finish in this room.
              </p>
            )}
          </ul>
        </div>

        {/* Center: Pomodoro Timer */}
        <div
          className="lg:col-span-4 surface-card rounded-2xl p-5 flex flex-col items-center justify-between relative overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(280px 220px at 50% 48%, rgba(106, 85, 220, 0.08), transparent 72%)',
          }}
        >
          <div className="w-full flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#211E36]">Shared Timer</h2>
              <p className="text-xs text-[#77758A] font-mono tabular-nums">
                Session {sessionNum} of 4
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg text-[#6E6B80] hover:bg-[#F4F3F8] hover:text-[#211E36]"
              aria-label="Timer settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="relative w-52 h-52 flex items-center justify-center my-4">
            <svg className="w-52 h-52 -rotate-90" viewBox="0 0 196 196">
              <circle
                cx="98"
                cy="98"
                r={radius}
                fill="none"
                stroke="#EAE6F6"
                strokeWidth="10"
              />
              <circle
                cx="98"
                cy="98"
                r={radius}
                fill="none"
                stroke={phase === 'focus' ? '#6A55DC' : '#0EA5E9'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-[stroke-dashoffset] duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold font-mono tabular-nums text-[#211E36]">
                {mins}:{secs}
              </span>
              <span className="text-[11px] font-semibold tracking-wider text-[#6A55DC] mt-1">
                {phase === 'focus'
                  ? 'FOCUS SPRINT'
                  : phase === 'shortBreak'
                    ? 'SHORT BREAK'
                    : 'LONG BREAK'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-[#E6E4F0] bg-white text-[#5E5A75] hover:bg-[#F8F6FF]"
              aria-label="Reset room timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5F4DCC] to-[#7461EC] text-white text-sm font-semibold shadow-sm hover:shadow-md hover:shadow-[#6A55DC]/20 transition-all"
            >
              {running ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="p-2.5 rounded-xl border border-[#E6E4F0] bg-white text-[#5E5A75] hover:bg-[#F8F6FF]"
              aria-label="Skip interval"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Session Chat */}
        <div className="lg:col-span-4 surface-card rounded-2xl p-5 flex flex-col h-[420px]">
          <div className="pb-3 border-b border-[#F0EEF5]">
            <h2 className="text-base font-bold text-[#211E36]">Session Chat</h2>
            <p className="text-xs text-[#77758A]">
              Check in with {activeBuddy.name} at the start and end of focus blocks
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'me' ? 'items-end' : 'items-start'
                }`}
              >
                <span className="text-[11px] text-[#8B889E] mb-1">
                  {m.author} · {m.time}
                </span>
                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-xl text-sm leading-relaxed ${
                    m.sender === 'me'
                      ? 'bg-[#6A55DC] text-white'
                      : 'bg-[#F4F3F8] text-[#211E36] border border-[#E6E4F0]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {buddyTyping && (
              <p className="text-xs text-[#77758A]">
                {activeBuddy.name} is typing...
              </p>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#F0EEF5] flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 px-3 py-2 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm focus:outline-none focus:border-[#6A55DC]"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-[#6A55DC] text-white hover:bg-[#5B47C7]"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#19172D]/50 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSettings(false);
          }}
        >
          <div className="bg-white border border-[#E6E4F0] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-[#211E36]">Timer Settings</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#5E5A75] mb-1">
                  Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={focusMins}
                  onChange={(e) => setFocusMins(Math.max(1, Number(e.target.value) || 25))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E4F0] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5E5A75] mb-1">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={shortBreakMins}
                  onChange={(e) => setShortBreakMins(Math.max(1, Number(e.target.value) || 5))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E4F0] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5E5A75] mb-1">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={longBreakMins}
                  onChange={(e) => setLongBreakMins(Math.max(1, Number(e.target.value) || 15))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E4F0] text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-xl border border-[#E6E4F0] text-sm font-semibold text-[#5E5A75]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setRunning(false);
                  setPhase('focus');
                  setSecondsLeft(focusMins * 60);
                  setShowSettings(false);
                  onToast('Timer settings updated.', 'success');
                }}
                className="px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
