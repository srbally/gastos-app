-- ============================================================
-- Gastos — Supabase Migration (multi-tenant SaaS)
-- Pega todo este archivo en Supabase → SQL Editor → Run
-- ============================================================

-- Extensiones
create extension if not exists "pgcrypto";

-- ── Tablas ──────────────────────────────────────────────────

create table if not exists public.tenants (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique not null,   -- sha256(email|lower(tenant_name)) — garantiza unicidad por email+nombre
  owner_id   uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  full_name         text,
  initials          text,
  color             text default 'oklch(0.62 0.12 162)',
  current_tenant_id uuid references public.tenants(id) on delete set null,
  updated_at        timestamptz default now()
);

create table if not exists public.tenant_members (
  id        uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      text not null default 'member' check (role in ('admin','member')),
  joined_at timestamptz default now(),
  unique(tenant_id, user_id)
);

create table if not exists public.expenses (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  title      text not null,
  amount     numeric(10,2) not null check (amount > 0),
  category   text not null,
  paid_by    uuid references auth.users(id) on delete set null,
  date       date not null default current_date,
  recurring  boolean default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.budgets (
  id        uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category  text not null,
  amount    numeric(10,2) not null check (amount >= 0),
  unique(tenant_id, category)
);

-- Índices
create index if not exists idx_expenses_tenant_date on public.expenses(tenant_id, date);
create index if not exists idx_tm_user              on public.tenant_members(user_id);
create index if not exists idx_tm_tenant            on public.tenant_members(tenant_id);

-- ── Función helper (security definer para evitar recursión en RLS) ──

create or replace function public.get_user_tenant_ids()
returns setof uuid language sql security definer stable as $$
  select tenant_id from public.tenant_members where user_id = auth.uid()
$$;
grant execute on function public.get_user_tenant_ids() to authenticated;

-- ── RLS ─────────────────────────────────────────────────────

-- tenants
alter table public.tenants enable row level security;
drop policy if exists "members see their tenants"  on public.tenants;
drop policy if exists "owner updates tenant"        on public.tenants;
create policy "members see their tenants" on public.tenants for select
  using (id in (select public.get_user_tenant_ids()));
create policy "owner updates tenant" on public.tenants for update
  using (owner_id = auth.uid());

-- profiles
alter table public.profiles enable row level security;
drop policy if exists "see profiles in same tenant" on public.profiles;
drop policy if exists "insert own profile"           on public.profiles;
drop policy if exists "update own profile"           on public.profiles;
create policy "see profiles in same tenant" on public.profiles for select
  using (
    id = auth.uid() or
    id in (
      select user_id from public.tenant_members
      where tenant_id in (select public.get_user_tenant_ids())
    )
  );
create policy "insert own profile" on public.profiles for insert
  with check (id = auth.uid());
create policy "update own profile" on public.profiles for update
  using (id = auth.uid());

-- tenant_members
alter table public.tenant_members enable row level security;
drop policy if exists "see own tenant members" on public.tenant_members;
drop policy if exists "admins insert members"  on public.tenant_members;
drop policy if exists "admins delete members"  on public.tenant_members;
create policy "see own tenant members" on public.tenant_members for select
  using (tenant_id in (select public.get_user_tenant_ids()));
create policy "admins insert members" on public.tenant_members for insert
  with check (tenant_id in (
    select tm.tenant_id from public.tenant_members tm
    where tm.user_id = auth.uid() and tm.role = 'admin'
  ));
create policy "admins delete members" on public.tenant_members for delete
  using (tenant_id in (
    select tm.tenant_id from public.tenant_members tm
    where tm.user_id = auth.uid() and tm.role = 'admin'
  ));

-- expenses
alter table public.expenses enable row level security;
drop policy if exists "tenant members see expenses"       on public.expenses;
drop policy if exists "tenant members insert expenses"    on public.expenses;
drop policy if exists "creator or admin updates expense"  on public.expenses;
drop policy if exists "creator or admin deletes expense"  on public.expenses;
create policy "tenant members see expenses" on public.expenses for select
  using (tenant_id in (select public.get_user_tenant_ids()));
create policy "tenant members insert expenses" on public.expenses for insert
  with check (tenant_id in (select public.get_user_tenant_ids()));
create policy "creator or admin updates expense" on public.expenses for update
  using (
    created_by = auth.uid() or
    tenant_id in (
      select tm.tenant_id from public.tenant_members tm
      where tm.user_id = auth.uid() and tm.role = 'admin'
    )
  );
create policy "creator or admin deletes expense" on public.expenses for delete
  using (
    created_by = auth.uid() or
    tenant_id in (
      select tm.tenant_id from public.tenant_members tm
      where tm.user_id = auth.uid() and tm.role = 'admin'
    )
  );

-- budgets
alter table public.budgets enable row level security;
drop policy if exists "tenant members see budgets" on public.budgets;
drop policy if exists "admins manage budgets"      on public.budgets;
create policy "tenant members see budgets" on public.budgets for select
  using (tenant_id in (select public.get_user_tenant_ids()));
create policy "admins manage budgets" on public.budgets for all
  using (tenant_id in (
    select tm.tenant_id from public.tenant_members tm
    where tm.user_id = auth.uid() and tm.role = 'admin'
  ));

-- ── Triggers ─────────────────────────────────────────────────

-- Crea el perfil automáticamente cuando se registra un usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  palette text[] := array[
    'oklch(0.62 0.12 162)',
    'oklch(0.60 0.12 250)',
    'oklch(0.66 0.12 320)',
    'oklch(0.68 0.12  60)'
  ];
begin
  insert into public.profiles (id, full_name, initials, color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    upper(left(coalesce(new.raw_user_meta_data->>'full_name', new.email), 1)),
    palette[1 + (floor(random() * 4))::int]
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Fuerza created_by = auth.uid() para que nadie pueda suplantar al pagador
create or replace function public.set_expense_created_by()
returns trigger language plpgsql as $$
begin
  new.created_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists on_expense_insert on public.expenses;
create trigger on_expense_insert
  before insert on public.expenses
  for each row execute procedure public.set_expense_created_by();

-- ── RPC: create_tenant ───────────────────────────────────────
-- El slug = sha256(email|lower(nombre)) → mismo email+nombre = mismo tenant, distinto = distinto
-- Así puede haber "Casa García" de dos emails distintos sin colisión de slug.

create or replace function public.create_tenant(p_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id   uuid;
  v_slug text;
begin
  v_slug := encode(
    digest(coalesce(auth.email(), auth.uid()::text) || '|' || lower(trim(p_name)), 'sha256'),
    'hex'
  );

  insert into public.tenants (name, slug, owner_id)
  values (trim(p_name), v_slug, auth.uid())
  returning id into v_id;

  insert into public.tenant_members (tenant_id, user_id, role)
  values (v_id, auth.uid(), 'admin');

  update public.profiles
    set current_tenant_id = v_id
    where id = auth.uid();

  -- Presupuestos por defecto
  insert into public.budgets (tenant_id, category, amount) values
    (v_id, 'vivienda',   1200),
    (v_id, 'comida',      650),
    (v_id, 'transporte',  280),
    (v_id, 'servicios',   320),
    (v_id, 'ocio',        250),
    (v_id, 'salud',       180),
    (v_id, 'otros',       150);

  return v_id;
end;
$$;
grant execute on function public.create_tenant(text) to authenticated;

-- ── Ingresos ─────────────────────────────────────────────────
-- Permite registrar ingresos además de gastos en la misma tabla.
-- Seguro de volver a pegar y correr aunque ya hayas migrado antes.

alter table public.expenses
  add column if not exists type text not null default 'gasto';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'expenses_type_check'
  ) then
    alter table public.expenses
      add constraint expenses_type_check check (type in ('gasto','ingreso'));
  end if;
end $$;
