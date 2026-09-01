"use client";

import { useMemo, useState, type DragEvent, type FormEvent } from "react";
import { taskStatuses, type TaskStatus } from "@/lib/tasks";

export type TaskComment = { id: string; task_id: string; body: string; created_at: string };
export type Task = {
  id: string; title: string; description: string; status: TaskStatus;
  priority: "low" | "medium" | "high"; created_at: string; task_comments?: TaskComment[];
};

type TaskForm = Pick<Task, "title" | "description" | "status" | "priority">;
type ViewMode = "board" | "list";
const emptyForm: TaskForm = { title: "", description: "", status: "open", priority: "medium" };
const statusLabels: Record<TaskStatus, string> = { open: "Open", in_progress: "In Progress", pending: "Pending", canceled: "Canceled", completed: "Completed" };

export function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [form, setForm] = useState({ ...emptyForm });
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [view, setView] = useState<ViewMode>("board");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const shown = useMemo(() => filter === "all" ? tasks : tasks.filter((task) => task.status === filter), [tasks, filter]);
  const visibleStatuses = filter === "all" ? taskStatuses : taskStatuses.filter((status) => status === filter);

  async function createTask(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const response = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) setError(payload.error?.message ?? "Task could not be created.");
    else { setTasks((current) => [payload.data, ...current]); setForm({ ...emptyForm }); }
    setBusy(false);
  }

  async function updateTask(task: Task, patch: Partial<Pick<Task, "status" | "priority">>) {
    setError("");
    const response = await fetch(`/api/tasks/${task.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return setError(payload.error?.message ?? "Task could not be updated.");
    setTasks((current) => current.map((item) => item.id === task.id ? { ...payload.data, task_comments: item.task_comments ?? [] } : item));
  }

  async function deleteTask(task: Task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    setError("");
    const response = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    if (!response.ok) return setError("Task could not be deleted.");
    setTasks((current) => current.filter((item) => item.id !== task.id));
  }

  async function addComment(task: Task, event: FormEvent) {
    event.preventDefault();
    const body = commentDrafts[task.id]?.trim();
    if (!body) return;
    setError("");
    const response = await fetch(`/api/tasks/${task.id}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return setError(payload.error?.message ?? "Comment could not be added.");
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, task_comments: [...(item.task_comments ?? []), payload.data] } : item));
    setCommentDrafts((current) => ({ ...current, [task.id]: "" }));
  }

  async function deleteComment(task: Task, comment: TaskComment) {
    setError("");
    const response = await fetch(`/api/tasks/${task.id}/comments/${comment.id}`, { method: "DELETE" });
    if (!response.ok) return setError("Comment could not be deleted.");
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, task_comments: (item.task_comments ?? []).filter((entry) => entry.id !== comment.id) } : item));
  }

  function startDrag(event: DragEvent, task: Task) {
    event.dataTransfer.setData("text/task-id", task.id);
    event.dataTransfer.effectAllowed = "move";
    setDragging(task.id);
  }

  function dropTask(event: DragEvent, status: TaskStatus) {
    event.preventDefault();
    const task = tasks.find((item) => item.id === event.dataTransfer.getData("text/task-id"));
    setDragging(null);
    if (task && task.status !== status) void updateTask(task, { status });
  }

  const card = (task: Task) => <article className={`task-card ${dragging === task.id ? "is-dragging" : ""}`} key={task.id} draggable onDragStart={(event) => startDrag(event, task)} onDragEnd={() => setDragging(null)} data-testid={`task-${task.id}`}>
    <div className="task-card-main">
      <div className="task-card-heading"><h3>{task.title}</h3><span className={`status-badge status-${task.status}`}>{statusLabels[task.status]}</span></div>
      {task.description && <p>{task.description}</p>}
      <div className="task-meta"><span className={`priority priority-${task.priority}`}>{task.priority} priority</span><span>•</span><span>{task.task_comments?.length ?? 0} comments</span></div>
    </div>
    <div className="task-actions">
      <label><span>Status</span><select aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => updateTask(task, { status: event.target.value as TaskStatus })}>{taskStatuses.map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></label>
      <label><span>Priority</span><select aria-label={`Priority for ${task.title}`} value={task.priority} onChange={(event) => updateTask(task, { priority: event.target.value as Task["priority"] })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
      <button className="icon-button" onClick={() => deleteTask(task)} aria-label={`Delete ${task.title}`}>Delete</button>
    </div>
    <details className="task-comments">
      <summary>Comments ({task.task_comments?.length ?? 0})</summary>
      <div className="comment-list">
        {(task.task_comments ?? []).map((comment) => <div className="comment" key={comment.id}><p>{comment.body}</p><button className="text-button" onClick={() => deleteComment(task, comment)} aria-label={`Delete comment ${comment.body}`}>Remove</button></div>)}
        {!task.task_comments?.length && <p className="muted">No comments yet.</p>}
      </div>
      <form className="comment-form" onSubmit={(event) => addComment(task, event)}>
        <label><span className="sr-only">Comment on {task.title}</span><textarea value={commentDrafts[task.id] ?? ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [task.id]: event.target.value }))} maxLength={2000} placeholder="Add context or an update…" data-testid={`comment-input-${task.id}`} /></label>
        <button className="button secondary" data-testid={`comment-submit-${task.id}`}>Add comment</button>
      </form>
    </details>
  </article>;

  return <div className="task-layout">
    <form className="panel form-stack task-create-panel" onSubmit={createTask} data-testid="task-form">
      <h2>Add a task</h2>
      {error && <div className="alert error" role="alert">{error}</div>}
      <label>Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={120} required data-testid="task-title" /><span className="field-hint">{form.title.length} / 120</span></label>
      <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={1000} data-testid="task-description" /><span className="field-hint">{form.description.length} / 1000</span></label>
      <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TaskStatus })} data-testid="task-status">{taskStatuses.map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></label>
      <label>Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Task["priority"] })} data-testid="task-priority"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
      <button className="button primary" disabled={busy} data-testid="task-create">{busy ? "Adding…" : "Add task"}</button>
    </form>
    <section className="task-workspace" aria-labelledby="task-list-title">
      <div className="task-toolbar">
        <div><p className="eyebrow">Workspace</p><h2 id="task-list-title">Your tasks</h2><p className="muted">Drag cards between columns or use the status menu.</p></div>
        <div className="task-toolbar-controls">
          <div className="view-toggle" aria-label="Task view"><button type="button" aria-pressed={view === "board"} onClick={() => setView("board")} data-testid="view-board">Grid</button><button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} data-testid="view-list">List</button></div>
          <label>Filter by status<select value={filter} onChange={(event) => setFilter(event.target.value as TaskStatus | "all")} data-testid="task-filter"><option value="all">All tasks</option>{taskStatuses.map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></label>
        </div>
      </div>
      {view === "board" ? <div className="kanban-board" data-testid="task-board" tabIndex={0} aria-label="Task status board. Scroll horizontally to view every status column.">{visibleStatuses.map((status) => {
        const columnTasks = shown.filter((task) => task.status === status);
        return <section className="kanban-column" key={status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropTask(event, status)} data-testid={`status-column-${status}`} aria-labelledby={`status-${status}`}>
          <div className="column-heading"><h3 id={`status-${status}`}>{statusLabels[status]}</h3><span>{columnTasks.length}</span></div>
          <div className="column-cards">{columnTasks.map(card)}{!columnTasks.length && <div className="column-empty">Drop tasks here</div>}</div>
        </section>;
      })}</div> : <div className="task-list" data-testid="task-list">{shown.map(card)}{!shown.length && <div className="empty" data-testid="empty-state">No tasks match this view.</div>}</div>}
    </section>
  </div>;
}
