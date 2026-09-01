alter table public.tasks drop constraint if exists tasks_status_check;
update public.tasks set status = case status when 'todo' then 'open' when 'done' then 'completed' else status end;
alter table public.tasks alter column status set default 'open';
alter table public.tasks add constraint tasks_status_check check (status in ('open', 'in_progress', 'pending', 'canceled', 'completed'));

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists task_comments_task_created_idx on public.task_comments(task_id, created_at asc);
alter table public.task_comments enable row level security;

drop policy if exists "users can read comments on own tasks" on public.task_comments;
drop policy if exists "users can comment on own tasks" on public.task_comments;
drop policy if exists "users can delete comments on own tasks" on public.task_comments;

create policy "users can read comments on own tasks" on public.task_comments for select
using (auth.uid() = user_id and exists (select 1 from public.tasks where tasks.id = task_comments.task_id and tasks.user_id = auth.uid()));
create policy "users can comment on own tasks" on public.task_comments for insert
with check (auth.uid() = user_id and exists (select 1 from public.tasks where tasks.id = task_comments.task_id and tasks.user_id = auth.uid()));
create policy "users can delete comments on own tasks" on public.task_comments for delete
using (auth.uid() = user_id and exists (select 1 from public.tasks where tasks.id = task_comments.task_id and tasks.user_id = auth.uid()));

drop trigger if exists task_comments_updated_at on public.task_comments;
create trigger task_comments_updated_at before update on public.task_comments for each row execute function public.set_updated_at();
