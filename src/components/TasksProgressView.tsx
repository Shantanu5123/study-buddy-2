import React, { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { StudyGoal, StudyStats, SubjectProgress, TaskPriority, TodoTask } from '../types/study';
import { createId } from '../utils/textAnalysis';

interface TasksProgressViewProps {
  todos: TodoTask[];
  onUpdateTodos: (todos: TodoTask[]) => void;
  subjects: SubjectProgress[];
  onUpdateSubjects: (subjects: SubjectProgress[]) => void;
  goals: StudyGoal[];
  onUpdateGoals: (goals: StudyGoal[]) => void;
  stats: StudyStats;
  onRecordStudyActivity: () => void;
  onToast: (msg: string, tone?: 'success' | 'info' | 'warn' | 'error') => void;
}

type TodoFilter = 'all' | 'active' | 'done' | 'high';

export const TasksProgressView: React.FC<TasksProgressViewProps> = ({
  todos,
  onUpdateTodos,
  subjects,
  onUpdateSubjects,
  goals,
  onUpdateGoals,
  stats,
  onRecordStudyActivity,
  onToast,
}) => {
  const [todoText, setTodoText] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState<TodoFilter>('all');

  const [goalDraft, setGoalDraft] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubTopics, setNewSubTopics] = useState('');
  const [showAddSub, setShowAddSub] = useState(false);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoText.trim()) return;
    onUpdateTodos([
      {
        id: createId('todo'),
        text: todoText.trim(),
        priority,
        due: dueDate,
        done: false,
        createdAt: new Date().toISOString(),
      },
      ...todos,
    ]);
    setTodoText('');
    setDueDate('');
    onToast('Task added.', 'success');
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    if (filter === 'high') return t.priority === 'high';
    return true;
  });

  const handleToggleTodo = (task: TodoTask) => {
    const nextDone = !task.done;
    onUpdateTodos(
      todos.map((t) => (t.id === task.id ? { ...t, done: nextDone } : t))
    );
    if (nextDone) onRecordStudyActivity();
  };

  const handleToggleTopic = (subId: string, topic: string) => {
    let markedDone = false;
    onUpdateSubjects(
      subjects.map((s) => {
        if (s.id !== subId) return s;
        const alreadyDone = s.done.includes(topic);
        if (!alreadyDone) markedDone = true;
        const done = alreadyDone
          ? s.done.filter((item) => item !== topic)
          : [...s.done, topic];
        return { ...s, done };
      })
    );
    if (markedDone) onRecordStudyActivity();
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    const topics = newSubTopics
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onUpdateSubjects([
      ...subjects,
      {
        id: createId('sub'),
        name: newSubName.trim(),
        topics: topics.length > 0 ? topics : ['Chapter 1', 'Chapter 2'],
        done: [],
      },
    ]);
    setNewSubName('');
    setNewSubTopics('');
    setShowAddSub(false);
    onToast('Subject added to tracker.', 'success');
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalDraft.trim()) return;
    onUpdateGoals([...goals, { id: createId('goal'), text: goalDraft.trim(), done: false }]);
    setGoalDraft('');
  };

  // Build 12-week (84 days) activity grid ending today
  const today = new Date();
  const weeks: { date: string; minutes: number }[][] = [];
  const start = new Date(today);
  start.setDate(today.getDate() - 83);
  for (let w = 0; w < 12; w++) {
    const col: { date: string; minutes: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + w * 7 + d);
      const key = cur.toISOString().slice(0, 10);
      col.push({ date: key, minutes: stats.days[key] || 0 });
    }
    weeks.push(col);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#6A55DC] mb-1">Plan &amp; Track</p>
        <h1 className="text-3xl font-extrabold text-[#211E36]">Tasks &amp; Progress</h1>
        <p className="text-sm text-[#6E6B80] mt-1">
          Organize study tasks by priority, check off syllabus topics, and build your daily study streak.
        </p>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white border border-[#EAE8F2] rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#211E36]">12-Week Study Consistency</h2>
            <p className="text-xs text-[#77758A]">Daily focus minutes recorded by your timer</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#77758A]">
            <span>Less</span>
            <span className="w-3 h-3 rounded-xs bg-[#EEEBF7]" />
            <span className="w-3 h-3 rounded-xs bg-[#CFC6FA]" />
            <span className="w-3 h-3 rounded-xs bg-[#9E8DF3]" />
            <span className="w-3 h-3 rounded-xs bg-[#6A55DC]" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="inline-flex gap-1.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1.5">
                {week.map((day) => {
                  const bg =
                    day.minutes >= 60
                      ? 'bg-[#6A55DC]'
                      : day.minutes >= 25
                        ? 'bg-[#9E8DF3]'
                        : day.minutes > 0
                          ? 'bg-[#CFC6FA]'
                          : 'bg-[#EEEBF7]';
                  return (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.minutes} min`}
                      className={`w-3.5 h-3.5 rounded-xs ${bg}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Study To-Do List */}
        <div className="lg:col-span-6 bg-white border border-[#EAE8F2] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#211E36]">Study To-Do List</h2>
            <span className="text-xs font-mono tabular-nums text-[#77758A]">
              {todos.filter((t) => t.done).length} / {todos.length} done
            </span>
          </div>

          <form onSubmit={handleAddTodo} className="space-y-2.5">
            <input
              type="text"
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              placeholder="Add an assignment or study task..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm text-[#211E36] focus:outline-none focus:border-[#6A55DC]"
            />
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                aria-label="Task priority"
                className="px-3 py-2 rounded-xl border border-[#E6E4F0] bg-white text-xs font-semibold text-[#3D3956]"
              >
                <option value="high">High priority</option>
                <option value="medium">Medium priority</option>
                <option value="low">Low priority</option>
              </select>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                aria-label="Due date"
                className="px-3 py-2 rounded-xl border border-[#E6E4F0] bg-white text-xs text-[#3D3956]"
              />
              <button
                type="submit"
                className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-xs font-semibold hover:bg-[#5B47C7]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
            </div>
          </form>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1 p-1 bg-[#F4F3F8] rounded-xl">
              {(['all', 'active', 'done', 'high'] as TodoFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    filter === f
                      ? 'bg-white text-[#211E36] shadow-xs'
                      : 'text-[#6E6B80] hover:text-[#211E36]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {todos.some((t) => t.done) && (
              <button
                type="button"
                onClick={() => onUpdateTodos(todos.filter((t) => !t.done))}
                className="text-xs font-semibold text-[#6A55DC] hover:underline"
              >
                Clear done
              </button>
            )}
          </div>

          {filteredTodos.length > 0 ? (
            <ul className="space-y-2">
              {filteredTodos.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#EEEBF5] bg-[#FAF9FD]"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTodo(task)}
                    className="flex items-start gap-2.5 text-left flex-1 min-w-0"
                  >
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        task.done
                          ? 'bg-[#10B981] border-[#10B981] text-white'
                          : 'bg-white border-[#C9C6D9]'
                      }`}
                    >
                      {task.done && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          task.done
                            ? 'line-through text-[#8B889E]'
                            : 'text-[#211E36]'
                        }`}
                      >
                        {task.text}
                      </p>
                      <p className="text-[11px] text-[#77758A] mt-0.5">
                        {task.priority === 'high'
                          ? 'High priority'
                          : task.priority === 'medium'
                            ? 'Medium priority'
                            : 'Low priority'}
                        {task.due && ` · Due ${task.due}`}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateTodos(todos.filter((t) => t.id !== task.id))
                    }
                    className="p-1.5 text-[#8D899F] hover:text-[#DC2626]"
                    aria-label={`Delete ${task.text}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#8B889E] py-6 text-center">
              No tasks in this view yet.
            </p>
          )}
        </div>

        {/* Subjects & Goals */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white border border-[#EAE8F2] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-[#211E36]">Syllabus Topics</h2>
              <button
                type="button"
                onClick={() => setShowAddSub((s) => !s)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#6A55DC] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Subject
              </button>
            </div>

            {showAddSub && (
              <form
                onSubmit={handleAddSubject}
                className="p-3.5 rounded-xl bg-[#FAF9FD] border border-[#E6E4F0] space-y-2.5"
              >
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Subject name (e.g. Biology)"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E6E4F0] bg-white text-sm"
                />
                <input
                  type="text"
                  value={newSubTopics}
                  onChange={(e) => setNewSubTopics(e.target.value)}
                  placeholder="Topics separated by commas (e.g. Genetics, Cell Cycle)"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E6E4F0] bg-white text-sm"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSub(false)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-[#6E6B80]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-[#6A55DC] text-white text-xs font-semibold"
                  >
                    Save Subject
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {subjects.map((sub) => {
                const pct =
                  sub.topics.length > 0
                    ? Math.round((sub.done.length / sub.topics.length) * 100)
                    : 0;
                return (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl border border-[#EEEBF5] bg-[#FAF9FD] space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-[#211E36]">{sub.name}</span>
                      <span className="font-mono tabular-nums text-xs font-semibold text-[#6A55DC]">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#EAE7F5] overflow-hidden">
                      <div
                        className="h-full bg-[#6A55DC] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sub.topics.map((topic) => {
                        const isDone = sub.done.includes(topic);
                        return (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => handleToggleTopic(sub.id, topic)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                              isDone
                                ? 'border-[#10B981] bg-[#ECFDF5] text-[#047857]'
                                : 'border-[#E2DEF2] bg-white text-[#5E5A75] hover:border-[#6A55DC]'
                            }`}
                          >
                            {isDone ? '✓ ' : ''}
                            {topic}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-[#EAE8F2] rounded-2xl p-5 space-y-3">
            <h2 className="text-base font-bold text-[#211E36]">Weekly Goals</h2>
            <form onSubmit={handleAddGoal} className="flex gap-2">
              <input
                type="text"
                value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value)}
                placeholder="Add a weekly study goal..."
                className="flex-1 px-3 py-2 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#6A55DC] text-white text-xs font-semibold"
              >
                Add
              </button>
            </form>
            <ul className="divide-y divide-[#F0EEF5]">
              {goals.map((g) => (
                <li
                  key={g.id}
                  className="py-2.5 flex items-center justify-between gap-2"
                >
                  <button
                    type="button"
                    onClick={() => {
                      const nextDone = !g.done;
                      onUpdateGoals(
                        goals.map((item) =>
                          item.id === g.id ? { ...item, done: nextDone } : item
                        )
                      );
                      if (nextDone) onRecordStudyActivity();
                    }}
                    className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                  >
                    <span
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                        g.done
                          ? 'bg-[#10B981] border-[#10B981] text-white'
                          : 'border-[#C9C6D9]'
                      }`}
                    >
                      {g.done && <Check className="w-3 h-3" />}
                    </span>
                    <span
                      className={`text-sm ${
                        g.done ? 'line-through text-[#8B889E]' : 'text-[#211E36]'
                      }`}
                    >
                      {g.text}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateGoals(goals.filter((item) => item.id !== g.id))
                    }
                    className="p-1 text-[#8D899F] hover:text-[#DC2626]"
                    aria-label="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
