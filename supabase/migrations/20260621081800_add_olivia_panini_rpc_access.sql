create extension if not exists pgcrypto with schema extensions;

create table if not exists public.olivia_panini_access (
  id text primary key,
  owner_token_sha256 text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.olivia_panini_access enable row level security;

insert into public.olivia_panini_access (id, owner_token_sha256)
values ('olivia', 'ada5d8459d94e5633d511b52f58cf2209cf6f582417c286f65361a9780b3065e')
on conflict (id) do update
set owner_token_sha256 = excluded.owner_token_sha256,
    updated_at = now();

create or replace function public.touch_olivia_panini_state()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.olivia_panini_has_owner_access(p_owner_token text)
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1
    from public.olivia_panini_access
    where id = 'olivia'
      and owner_token_sha256 = encode(extensions.digest(coalesce(p_owner_token, ''), 'sha256'), 'hex')
  );
$$;

create or replace function public.olivia_panini_validate_state(p_state jsonb)
returns boolean
language sql
security definer
set search_path = public
as $$
  select jsonb_typeof(p_state) = 'object'
    and octet_length(p_state::text) <= 200000
    and (p_state ? 'teams')
    and (p_state ? 'trades')
    and (p_state ? 'newOnes')
    and (p_state ? 'tradeShares');
$$;

create or replace function public.olivia_panini_read_state(p_owner_token text)
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
  from public.olivia_panini_state
  where id = 'olivia';

  return coalesce(v_state, '{}'::jsonb);
end;
$$;

create or replace function public.olivia_panini_write_state(p_owner_token text, p_state jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_state jsonb := p_state;
begin
  if not public.olivia_panini_has_owner_access(p_owner_token) then
    raise exception 'invalid owner token' using errcode = '28000';
  end if;

  if not public.olivia_panini_validate_state(v_state) then
    raise exception 'invalid panini state' using errcode = '22023';
  end if;

  insert into public.olivia_panini_state (id, state, updated_at)
  values ('olivia', v_state, now())
  on conflict (id) do update
  set state = excluded.state,
      updated_at = now();

  return v_state;
end;
$$;

create or replace function public.olivia_panini_read_share(p_share_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_share jsonb;
begin
  if p_share_id is null or p_share_id !~ '^[A-Za-z0-9-]{8,80}$' then
    return null;
  end if;

  select state #> array['tradeShares', p_share_id]
  into v_share
  from public.olivia_panini_state
  where id = 'olivia';

  return v_share;
end;
$$;

create or replace function public.olivia_panini_submit_claim(p_share_id text, p_friend_name text, p_wanted text[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state jsonb;
  v_share jsonb;
  v_items jsonb;
  v_claims jsonb;
  v_claim jsonb;
  v_wanted jsonb;
  v_name text;
  v_now text := to_jsonb(now()) #>> '{}';
begin
  if p_share_id is null or p_share_id !~ '^[A-Za-z0-9-]{8,80}$' then
    raise exception 'invalid share id' using errcode = '22023';
  end if;

  v_name := left(regexp_replace(trim(coalesce(p_friend_name, '')), '\s+', ' ', 'g'), 80);
  if v_name = '' then
    raise exception 'invalid friend name' using errcode = '22023';
  end if;

  select state into v_state
  from public.olivia_panini_state
  where id = 'olivia'
  for update;

  v_share := v_state #> array['tradeShares', p_share_id];
  if v_share is null then
    raise exception 'unknown share id' using errcode = '22023';
  end if;

  v_items := coalesce(v_share -> 'items', '{}'::jsonb);

  select coalesce(jsonb_agg(label order by label), '[]'::jsonb)
  into v_wanted
  from (
    select distinct upper(trim(value)) as label
    from unnest(coalesce(p_wanted, array[]::text[])) as value
    where v_items ? upper(trim(value))
  ) wanted_labels;

  if jsonb_array_length(v_wanted) = 0 then
    raise exception 'empty wanted list' using errcode = '22023';
  end if;

  select coalesce(jsonb_agg(claim), '[]'::jsonb)
  into v_claims
  from jsonb_array_elements(coalesce(v_share -> 'claims', '[]'::jsonb)) as claim
  where lower(coalesce(claim ->> 'friendName', '')) <> lower(v_name);

  v_claim := jsonb_build_object(
    'friendName', v_name,
    'wanted', v_wanted,
    'updatedAt', v_now
  );

  v_share := jsonb_set(v_share, '{claims}', v_claims || jsonb_build_array(v_claim), true);
  v_share := jsonb_set(v_share, '{updatedAt}', to_jsonb(v_now), true);
  v_state := jsonb_set(v_state, array['tradeShares', p_share_id], v_share, true);

  update public.olivia_panini_state
  set state = v_state,
      updated_at = now()
  where id = 'olivia';

  return v_share;
end;
$$;

revoke all on public.olivia_panini_access from anon, authenticated;

revoke all on function public.olivia_panini_has_owner_access(text) from public;
revoke all on function public.olivia_panini_validate_state(jsonb) from public;
revoke all on function public.olivia_panini_read_state(text) from public;
revoke all on function public.olivia_panini_write_state(text, jsonb) from public;
revoke all on function public.olivia_panini_read_share(text) from public;
revoke all on function public.olivia_panini_submit_claim(text, text, text[]) from public;

revoke execute on function public.olivia_panini_has_owner_access(text) from anon, authenticated;
revoke execute on function public.olivia_panini_validate_state(jsonb) from anon, authenticated;

grant execute on function public.olivia_panini_read_state(text) to anon, authenticated;
grant execute on function public.olivia_panini_write_state(text, jsonb) to anon, authenticated;
grant execute on function public.olivia_panini_read_share(text) to anon, authenticated;
grant execute on function public.olivia_panini_submit_claim(text, text, text[]) to anon, authenticated;
