-- Verso Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- Users profile (extends Supabase Auth)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'basic', 'pro', 'business')),
  ls_customer_id text,
  preferred_language text default 'en' check (preferred_language in ('en', 'pl', 'es', 'de', 'uk')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Conversations
-- ============================================
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text default 'New Conversation',
  funnel_stage text default 'Awareness' check (funnel_stage in ('Awareness', 'Interest', 'Consideration', 'Intent', 'Purchase')),
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_conversations_user on public.conversations(user_id);
create index idx_conversations_stage on public.conversations(funnel_stage);

alter table public.conversations enable row level security;

create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- ============================================
-- Messages
-- ============================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index idx_messages_conversation on public.messages(conversation_id);

alter table public.messages enable row level security;

create policy "Users can view own messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy "Users can create messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

-- ============================================
-- Knowledge Base
-- ============================================
create table public.knowledge_base (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_kb_user on public.knowledge_base(user_id);

alter table public.knowledge_base enable row level security;

create policy "Users can view own KB docs"
  on public.knowledge_base for select
  using (auth.uid() = user_id);

create policy "Users can create KB docs"
  on public.knowledge_base for insert
  with check (auth.uid() = user_id);

create policy "Users can update own KB docs"
  on public.knowledge_base for update
  using (auth.uid() = user_id);

create policy "Users can delete own KB docs"
  on public.knowledge_base for delete
  using (auth.uid() = user_id);

-- ============================================
-- Integrations
-- ============================================
create table public.integrations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  provider text not null check (provider in ('google-calendar', 'trello', 'hubstaff', 'shop-chat')),
  is_active boolean default false,
  access_token text,
  refresh_token text,
  config jsonb default '{}',
  last_sync timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, provider)
);

create index idx_integrations_user on public.integrations(user_id);

alter table public.integrations enable row level security;

create policy "Users can view own integrations"
  on public.integrations for select
  using (auth.uid() = user_id);

create policy "Users can manage own integrations"
  on public.integrations for all
  using (auth.uid() = user_id);

-- ============================================
-- Subscriptions
-- ============================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  ls_subscription_id text,
  ls_customer_id text,
  ls_variant_id text,
  tier text default 'free' check (tier in ('free', 'basic', 'pro', 'business')),
  status text default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_subscriptions_user on public.subscriptions(user_id);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ============================================
-- Updated_at trigger
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.conversations
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.knowledge_base
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.integrations
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();
