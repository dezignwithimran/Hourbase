-- Hourbase — run this in the Supabase SQL editor.
-- Enable if not already: Authentication > Providers > Email, optional Google.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text,
  avatar text,
  company text,
  bio text,
  country text,
  timezone text not null default 'UTC',
  currency text not null default 'USD',
  default_hourly_rate numeric not null default 0,
  working_hours_per_day numeric not null default 8,
  appearance text not null default 'system' check (appearance in ('light', 'dark', 'system')),
  notify_timer_reminders boolean not null default true,
  notify_weekly_summary boolean not null default true,
  notify_invoice_reminders boolean not null default true,
  onboarding_completed boolean not null default false,
  plan text not null default 'free' check (plan in ('free', 'pro', 'studio')),
  plan_interval text not null default 'monthly' check (plan_interval in ('monthly', 'yearly')),
  plan_status text not null default 'active' check (plan_status in ('active', 'canceled')),
  plan_renews_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists plan text not null default 'free';
alter table public.profiles add column if not exists plan_interval text not null default 'monthly';
alter table public.profiles add column if not exists plan_status text not null default 'active';
alter table public.profiles add column if not exists plan_renews_at timestamptz;
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;
alter table public.profiles add column if not exists paddle_customer_id text;
alter table public.profiles add column if not exists paddle_subscription_id text;
alter table public.profiles add column if not exists team_members jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists support_tickets jsonb not null default '[]'::jsonb;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  description text,
  hourly_rate numeric not null default 0,
  currency text not null default 'USD',
  billing_type text not null default 'hourly' check (billing_type in ('hourly', 'fixed')),
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  start_date date,
  end_date date,
  color text not null default '#2563EB',
  created_at timestamptz not null default now()
);

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  description text not null default '',
  start_time timestamptz not null,
  end_time timestamptz,
  duration integer not null default 0,
  billable boolean not null default true,
  hourly_rate numeric not null default 0,
  earnings numeric not null default 0,
  status text not null default 'completed' check (status in ('running', 'paused', 'completed')),
  created_at timestamptz not null default now()
);

create unique index if not exists time_entries_one_active_timer
  on public.time_entries (user_id)
  where status in ('running', 'paused');

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  invoice_number text not null,
  issue_date date not null,
  due_date date not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  subtotal numeric not null default 0,
  discount numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null,
  quantity numeric not null default 1,
  rate numeric not null default 0,
  amount numeric not null default 0
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.time_entries enable row level security;
alter table public.tasks enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

create policy "profiles_own" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "clients_own" on public.clients for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "projects_own" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "time_entries_own" on public.time_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "tasks_own" on public.tasks;
create policy "tasks_own" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "invoices_own" on public.invoices for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "invoice_items_own" on public.invoice_items for all
  using (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid()))
  with check (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
