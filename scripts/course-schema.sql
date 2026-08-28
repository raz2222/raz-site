-- ============================================================================
-- Higgsfield course ("פריים ראשון") — schema, RLS and RPCs.
-- Lives on course.madebyraz.co.il, same Supabase project as the rest of the site.
--
-- Content lock model (server-enforced, cannot be bypassed from DevTools):
--   * course_lessons        — lesson METADATA. Public SELECT while published,
--                             so the full syllabus is visible to everyone.
--   * course_lesson_content — body_he + video_url, in a SEPARATE table whose
--                             RLS only lets a row through for the site owner,
--                             a free lesson, or a user with active course_access.
--   * get_lesson(slug)      — SECURITY DEFINER convenience RPC: one call returns
--                             metadata always, body/video only when allowed, plus
--                             `locked` / `has_access` flags for the UI.
--
-- This file is the source of truth for the migration applied to project
-- beobkcttzwiqcawrprgg. Re-runnable (idempotent-ish: guarded drops on policies).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.course_lessons (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  module_no    int  not null,
  lesson_no    int  not null,
  order_index  int  not null,
  title_he     text not null,
  summary_he   text,
  duration_min int,
  is_free      boolean not null default false,
  published    boolean not null default false,
  resources    jsonb   not null default '[]'::jsonb,   -- [{label, url}]
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Gated content, one row per lesson.
create table if not exists public.course_lesson_content (
  lesson_id  uuid primary key references public.course_lessons(id) on delete cascade,
  slug       text unique not null,
  body_he    text,                                     -- Markdown
  video_url  text,                                     -- youtube-nocookie embed URL
  updated_at timestamptz not null default now()
);

-- Orders. Filled properly once a real payment provider is wired; for now the
-- manual checkout inserts a 'pending' row and notifies the owner.
create table if not exists public.course_orders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete set null,
  email         text not null,
  amount_agorot int  not null,
  currency      text not null default 'ILS',
  provider      text,
  provider_ref  text,
  status        text not null default 'pending'
                check (status in ('pending','paid','refunded','failed')),
  note          text,
  created_at    timestamptz not null default now()
);

-- Who has access. One row per user.
create table if not exists public.course_access (
  user_id    uuid primary key references auth.users on delete cascade,
  status     text not null default 'active'  check (status in ('active','revoked')),
  source     text not null default 'admin'   check (source in ('purchase','admin','comp')),
  order_id   uuid references public.course_orders on delete set null,
  granted_by uuid references auth.users on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz                       -- null = forever
);

-- Progress ("mark complete").
create table if not exists public.course_progress (
  user_id      uuid not null references auth.users on delete cascade,
  lesson_slug  text not null references public.course_lessons(slug) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_slug)
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists course_lessons_touch on public.course_lessons;
create trigger course_lessons_touch before update on public.course_lessons
  for each row execute function public.touch_updated_at();

drop trigger if exists course_lesson_content_touch on public.course_lesson_content;
create trigger course_lesson_content_touch before update on public.course_lesson_content
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Same owner check the rest of the site's policies use.
create or replace function public.is_site_owner()
returns boolean language sql stable as $$
  select coalesce((auth.jwt() ->> 'email') = 'razavramov2@gmail.com', false)
$$;

create or replace function public.has_course_access(p_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.course_access ca
    where ca.user_id = p_uid
      and ca.status = 'active'
      and (ca.expires_at is null or ca.expires_at > now())
  )
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.course_lessons        enable row level security;
alter table public.course_lesson_content enable row level security;
alter table public.course_orders         enable row level security;
alter table public.course_access         enable row level security;
alter table public.course_progress       enable row level security;

-- course_lessons: metadata is public once published; owner does everything.
drop policy if exists course_lessons_read  on public.course_lessons;
drop policy if exists course_lessons_write on public.course_lessons;
create policy course_lessons_read on public.course_lessons
  for select using (published or public.is_site_owner());
create policy course_lessons_write on public.course_lessons
  for all using (public.is_site_owner()) with check (public.is_site_owner());

-- course_lesson_content: body/video only for owner, free lessons, or entitled users.
drop policy if exists course_lesson_content_read  on public.course_lesson_content;
drop policy if exists course_lesson_content_write on public.course_lesson_content;
create policy course_lesson_content_read on public.course_lesson_content
  for select using (
    public.is_site_owner()
    or exists (
      select 1 from public.course_lessons l
      where l.id = course_lesson_content.lesson_id
        and l.published
        and (l.is_free or public.has_course_access(auth.uid()))
    )
  );
create policy course_lesson_content_write on public.course_lesson_content
  for all using (public.is_site_owner()) with check (public.is_site_owner());

-- course_orders: owner sees all; a user sees their own (by id or email).
drop policy if exists course_orders_read   on public.course_orders;
drop policy if exists course_orders_insert on public.course_orders;
drop policy if exists course_orders_write  on public.course_orders;
create policy course_orders_read on public.course_orders
  for select using (
    public.is_site_owner()
    or user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
-- Manual checkout: anyone may lodge a pending order (mirrors public.leads insert).
create policy course_orders_insert on public.course_orders
  for insert to anon, authenticated with check (status = 'pending');
create policy course_orders_write on public.course_orders
  for all using (public.is_site_owner()) with check (public.is_site_owner());

-- course_access: owner writes; a user may read only their own row.
drop policy if exists course_access_read  on public.course_access;
drop policy if exists course_access_write on public.course_access;
create policy course_access_read on public.course_access
  for select using (public.is_site_owner() or user_id = auth.uid());
create policy course_access_write on public.course_access
  for all using (public.is_site_owner()) with check (public.is_site_owner());

-- course_progress: a user owns their rows; owner may read everything.
drop policy if exists course_progress_own  on public.course_progress;
drop policy if exists course_progress_read on public.course_progress;
create policy course_progress_own on public.course_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy course_progress_read on public.course_progress
  for select using (public.is_site_owner() or user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- get_lesson(slug) — the gated read used by the lesson page
-- ---------------------------------------------------------------------------

create or replace function public.get_lesson(p_slug text)
returns table (
  slug         text,
  module_no    int,
  lesson_no    int,
  order_index  int,
  title_he     text,
  summary_he   text,
  duration_min int,
  is_free      boolean,
  published    boolean,
  resources    jsonb,
  body_he      text,
  video_url    text,
  has_access   boolean,
  locked       boolean
)
language plpgsql stable security definer set search_path = public as $$
declare
  v_owner  boolean := public.is_site_owner();
  v_access boolean := public.has_course_access(auth.uid());
begin
  return query
  select
    l.slug, l.module_no, l.lesson_no, l.order_index, l.title_he, l.summary_he,
    l.duration_min, l.is_free, l.published, l.resources,
    case when v_owner or l.is_free or v_access then c.body_he   end,
    case when v_owner or l.is_free or v_access then c.video_url end,
    (v_owner or v_access) as has_access,
    (not (v_owner or l.is_free or v_access)) as locked
  from public.course_lessons l
  left join public.course_lesson_content c on c.lesson_id = l.id
  where l.slug = p_slug and (l.published or v_owner);
end; $$;

grant execute on function public.get_lesson(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Admin RPCs (owner-guarded) for the /admin/course "גישות" + "הזמנות" tabs
-- ---------------------------------------------------------------------------

create or replace function public.admin_list_course_access()
returns table (
  user_id    uuid,
  email      text,
  status     text,
  source     text,
  granted_at timestamptz,
  expires_at timestamptz,
  order_id   uuid
)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_site_owner() then raise exception 'not authorized'; end if;
  return query
    select ca.user_id, u.email::text, ca.status, ca.source,
           ca.granted_at, ca.expires_at, ca.order_id
    from public.course_access ca
    join auth.users u on u.id = ca.user_id
    order by ca.granted_at desc;
end; $$;

create or replace function public.admin_grant_course_access(p_email text)
returns void
language plpgsql volatile security definer set search_path = public, auth as $$
declare v_uid uuid;
begin
  if not public.is_site_owner() then raise exception 'not authorized'; end if;
  select id into v_uid from auth.users where lower(email) = lower(trim(p_email));
  if v_uid is null then raise exception 'no user registered with %', p_email; end if;
  insert into public.course_access (user_id, status, source, granted_by)
    values (v_uid, 'active', 'admin', auth.uid())
  on conflict (user_id) do update
    set status = 'active', source = 'admin',
        granted_by = auth.uid(), granted_at = now(), expires_at = null;
end; $$;

create or replace function public.admin_set_course_access_status(p_user_id uuid, p_status text)
returns void
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_site_owner() then raise exception 'not authorized'; end if;
  if p_status not in ('active','revoked') then raise exception 'bad status'; end if;
  update public.course_access set status = p_status where user_id = p_user_id;
end; $$;

-- Approve a pending manual order: mark it paid and open access.
create or replace function public.admin_fulfill_course_order(p_order_id uuid)
returns void
language plpgsql volatile security definer set search_path = public, auth as $$
declare v_uid uuid; v_email text;
begin
  if not public.is_site_owner() then raise exception 'not authorized'; end if;
  select user_id, email into v_uid, v_email from public.course_orders where id = p_order_id;
  if not found then raise exception 'no such order'; end if;
  if v_uid is null then
    select id into v_uid from auth.users where lower(email) = lower(v_email);
  end if;
  update public.course_orders set status = 'paid' where id = p_order_id;
  if v_uid is not null then
    insert into public.course_access (user_id, status, source, order_id, granted_by)
      values (v_uid, 'active', 'purchase', p_order_id, auth.uid())
    on conflict (user_id) do update
      set status = 'active', source = 'purchase', order_id = p_order_id,
          granted_by = auth.uid(), granted_at = now(), expires_at = null;
  end if;
end; $$;

grant execute on function public.admin_list_course_access()                     to authenticated;
grant execute on function public.admin_grant_course_access(text)                to authenticated;
grant execute on function public.admin_set_course_access_status(uuid, text)     to authenticated;
grant execute on function public.admin_fulfill_course_order(uuid)               to authenticated;
