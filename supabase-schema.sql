-- CediSmart — Supabase SQL Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. Profiles table
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text,
  age int,
  university text,
  program text,
  year_of_study int,
  income_source text check (income_source in ('family','scholarship','work','mixed')),
  monthly_income numeric(10,2),
  currency_preference text default 'GHS',
  living_situation text check (living_situation in ('on-campus','off-campus')),
  has_roommates boolean,
  transport_mode text,
  savings_goal numeric(10,2),
  budget_period text default 'monthly',
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

-- 2. Budgets table
create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  period_type text check (period_type in ('weekly','monthly','semester')),
  start_date date not null,
  end_date date not null,
  total_amount numeric(10,2) not null,
  created_at timestamptz default now()
);

-- 3. Budget categories
create table budget_categories (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid references budgets(id) on delete cascade not null,
  category_name text not null,
  allocated_amount numeric(10,2) not null,
  color text not null
);

-- 4. Transactions
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  budget_id uuid references budgets(id) on delete set null,
  category text not null,
  amount numeric(10,2) not null,
  description text,
  date date not null,
  type text check (type in ('income','expense')) not null,
  created_at timestamptz default now()
);

-- 5. AI conversations
create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  messages jsonb not null default '[]',
  created_at timestamptz default now()
);

-- Enable Row Level Security on all tables
alter table profiles enable row level security;
alter table budgets enable row level security;
alter table budget_categories enable row level security;
alter table transactions enable row level security;
alter table ai_conversations enable row level security;

-- RLS Policies
create policy "Users own their profile"
  on profiles for all using (auth.uid() = user_id);

create policy "Users own their budgets"
  on budgets for all using (auth.uid() = user_id);

create policy "Users own their categories via budget"
  on budget_categories for all
  using (budget_id in (select id from budgets where user_id = auth.uid()));

create policy "Users own their transactions"
  on transactions for all using (auth.uid() = user_id);

create policy "Users own their conversations"
  on ai_conversations for all using (auth.uid() = user_id);

-- IMPORTANT: Disable email confirmation for faster signup (do in Dashboard):
-- Authentication → Providers → Email → Toggle off "Confirm email"
