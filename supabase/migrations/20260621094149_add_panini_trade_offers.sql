create or replace function public.olivia_panini_missing_labels(p_state jsonb)
returns jsonb
language sql
stable
set search_path = public
as $$
  select coalesce(jsonb_agg(team_code || ' ' || sticker_number order by team_order, sticker_number), '[]'::jsonb)
  from (
    values
      (1, 'MEX'), (2, 'RSA'), (3, 'KOR'), (4, 'CZE'),
      (5, 'CAN'), (6, 'BIH'), (7, 'QAT'), (8, 'SUI'),
      (9, 'BRA'), (10, 'MAR'), (11, 'HAI'), (12, 'SCO'),
      (13, 'USA'), (14, 'PAR'), (15, 'AUS'), (16, 'TUR'),
      (17, 'GER'), (18, 'CUW'), (19, 'CIV'), (20, 'ECU'),
      (21, 'NED'), (22, 'JPN'), (23, 'SWE'), (24, 'TUN'),
      (25, 'BEL'), (26, 'EGY'), (27, 'IRN'), (28, 'NZL'),
      (29, 'ESP'), (30, 'CPV'), (31, 'KSA'), (32, 'URU'),
      (33, 'FRA'), (34, 'SEN'), (35, 'IRQ'), (36, 'NOR'),
      (37, 'ARG'), (38, 'ALG'), (39, 'AUT'), (40, 'JOR'),
      (41, 'POR'), (42, 'COD'), (43, 'UZB'), (44, 'COL'),
      (45, 'ENG'), (46, 'CRO'), (47, 'GHA'), (48, 'PAN')
  ) as teams(team_order, team_code)
  cross join generate_series(1, 20) as stickers(sticker_number)
  where not exists (
    select 1
    from jsonb_array_elements_text(coalesce(p_state #> array['teams', team_code], '[]'::jsonb)) as owned(value)
    where owned.value ~ '^\d+$'
      and owned.value::int = sticker_number
  );
$$;

create or replace function public.olivia_panini_read_share(p_share_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state jsonb;
  v_share jsonb;
begin
  if p_share_id is null or p_share_id !~ '^[A-Za-z0-9-]{8,80}$' then
    return null;
  end if;

  select state
  into v_state
  from public.olivia_panini_state
  where id = 'olivia';

  v_share := v_state #> array['tradeShares', p_share_id];
  if v_share is null then
    return null;
  end if;

  return jsonb_set(v_share, '{missing}', public.olivia_panini_missing_labels(v_state), true);
end;
$$;

create or replace function public.olivia_panini_submit_trade_claim(
  p_share_id text,
  p_friend_name text,
  p_wanted text[],
  p_offered text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state jsonb;
  v_share jsonb;
  v_items jsonb;
  v_missing jsonb;
  v_claims jsonb;
  v_claim jsonb;
  v_wanted jsonb;
  v_offered jsonb;
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
  v_missing := public.olivia_panini_missing_labels(v_state);

  select coalesce(jsonb_agg(label order by label), '[]'::jsonb)
  into v_wanted
  from (
    select distinct upper(trim(value)) as label
    from unnest(coalesce(p_wanted, array[]::text[])) as value
    where v_items ? upper(trim(value))
  ) wanted_labels;

  select coalesce(jsonb_agg(label order by label), '[]'::jsonb)
  into v_offered
  from (
    select distinct upper(trim(value)) as label
    from unnest(coalesce(p_offered, array[]::text[])) as value
    where v_missing ? upper(trim(value))
  ) offered_labels;

  if jsonb_array_length(v_wanted) = 0 and jsonb_array_length(v_offered) = 0 then
    raise exception 'empty trade claim' using errcode = '22023';
  end if;

  select coalesce(jsonb_agg(claim), '[]'::jsonb)
  into v_claims
  from jsonb_array_elements(coalesce(v_share -> 'claims', '[]'::jsonb)) as claim
  where lower(coalesce(claim ->> 'friendName', '')) <> lower(v_name);

  v_claim := jsonb_build_object(
    'friendName', v_name,
    'wanted', v_wanted,
    'offered', v_offered,
    'updatedAt', v_now
  );

  v_share := jsonb_set(v_share, '{missing}', v_missing, true);
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

revoke all on function public.olivia_panini_missing_labels(jsonb) from public;
revoke all on function public.olivia_panini_submit_trade_claim(text, text, text[], text[]) from public;
revoke execute on function public.olivia_panini_missing_labels(jsonb) from anon, authenticated;
grant execute on function public.olivia_panini_submit_trade_claim(text, text, text[], text[]) to anon, authenticated;
