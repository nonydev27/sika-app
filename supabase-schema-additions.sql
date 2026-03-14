-- Sika App — Schema Additions
-- Run this in Supabase SQL Editor after the main schema

-- 6. Savings accounts
create table savings_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  target_amount numeric(10,2) not null default 0,
  current_amount numeric(10,2) not null default 0,
  color text not null default '#4988C4',
  icon text not null default 'piggy-bank',
  created_at timestamptz default now()
);

-- 7. Savings transactions (deposits/withdrawals per account)
create table savings_transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references savings_accounts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(10,2) not null,
  type text check (type in ('deposit','withdrawal')) not null,
  description text,
  date date not null default current_date,
  created_at timestamptz default now()
);

alter table savings_accounts enable row level security;
alter table savings_transactions enable row level security;

create policy "Users own their savings accounts"
  on savings_accounts for all using (auth.uid() = user_id);

create policy "Users own their savings transactions"
  on savings_transactions for all using (auth.uid() = user_id);

-- 8. AI usage tracking
create table ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null, -- format: 'YYYY-MM'
  chat_count int not null default 0,
  insights_count int not null default 0,
  receipt_count int not null default 0,
  unique(user_id, month)
);

-- 9. User plans
create table user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  pro_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. AI insights cache (avoid re-running expensive analysis)
create table ai_insights_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  data jsonb not null,
  cached_at timestamptz default now()
);

alter table ai_usage enable row level security;
alter table user_plans enable row level security;
alter table ai_insights_cache enable row level security;

create policy "Users own their usage" on ai_usage for all using (auth.uid() = user_id);
create policy "Users own their plan" on user_plans for all using (auth.uid() = user_id);
create policy "Users own their insights cache" on ai_insights_cache for all using (auth.uid() = user_id);

-- RPC for atomic usage increment (used by pro users for analytics)
create or replace function increment_ai_usage(p_user_id uuid, p_month text, p_type text)
returns void language plpgsql security definer as $$
begin
  insert into ai_usage (user_id, month, chat_count, insights_count, receipt_count)
  values (p_user_id, p_month, 0, 0, 0)
  on conflict (user_id, month) do nothing;

  if p_type = 'chat' then
    update ai_usage set chat_count = chat_count + 1 where user_id = p_user_id and month = p_month;
  elsif p_type = 'insights' then
    update ai_usage set insights_count = insights_count + 1 where user_id = p_user_id and month = p_month;
  elsif p_type = 'receipt' then
    update ai_usage set receipt_count = receipt_count + 1 where user_id = p_user_id and month = p_month;
  end if;
end;
$$;
