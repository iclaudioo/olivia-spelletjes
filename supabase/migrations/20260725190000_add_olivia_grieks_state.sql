-- Cloud-sync voor het Grieks-spel, met hetzelfde patroon als panini:
-- een jsonb-state per gezin, afgeschermd met het bestaande familie-token
-- (public.olivia_panini_has_owner_access) en enkel bereikbaar via RPC's.

create table if not exists public.olivia_grieks_state (
  id text primary key,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.olivia_grieks_state enable row level security;

revoke all on public.olivia_grieks_state from anon, authenticated;

create or replace function public.olivia_grieks_validate_state(p_state jsonb)
returns boolean
language sql
security definer
set search_path = public
as $$
  select jsonb_typeof(p_state) = 'object'
    and octet_length(p_state::text) <= 50000
    and (p_state ? 'sterren')
    and (p_state ? 'geschreven')
    and (p_state ? 'groepGoed');
$$;

create or replace function public.olivia_grieks_read_state(p_owner_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_state jsonb;
begin
  if not public.olivia_panini_has_owner_access(p_owner_token) then
    raise exception 'invalid owner token' using errcode = '28000';
  end if;

  select state into v_state
  from public.olivia_grieks_state
  where id = 'olivia';

  return coalesce(v_state, '{}'::jsonb);
end;
$$;

create or replace function public.olivia_grieks_write_state(p_owner_token text, p_state jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.olivia_panini_has_owner_access(p_owner_token) then
    raise exception 'invalid owner token' using errcode = '28000';
  end if;

  if not public.olivia_grieks_validate_state(p_state) then
    raise exception 'invalid grieks state' using errcode = '22023';
  end if;

  insert into public.olivia_grieks_state (id, state, updated_at)
  values ('olivia', p_state, now())
  on conflict (id) do update
  set state = excluded.state,
      updated_at = now();

  return p_state;
end;
$$;

revoke all on function public.olivia_grieks_validate_state(jsonb) from public;
revoke all on function public.olivia_grieks_read_state(text) from public;
revoke all on function public.olivia_grieks_write_state(text, jsonb) from public;

revoke execute on function public.olivia_grieks_validate_state(jsonb) from anon, authenticated;

grant execute on function public.olivia_grieks_read_state(text) to anon, authenticated;
grant execute on function public.olivia_grieks_write_state(text, jsonb) to anon, authenticated;
