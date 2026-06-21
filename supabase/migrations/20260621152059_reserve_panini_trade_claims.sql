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

  select coalesce(jsonb_agg(claim), '[]'::jsonb)
  into v_claims
  from jsonb_array_elements(coalesce(v_share -> 'claims', '[]'::jsonb)) as claim
  where lower(coalesce(claim ->> 'friendName', '')) <> lower(v_name);

  select coalesce(jsonb_agg(label order by label), '[]'::jsonb)
  into v_wanted
  from (
    select distinct upper(trim(value)) as label
    from unnest(coalesce(p_wanted, array[]::text[])) as value
  ) wanted_labels
  where v_items ? label
    and (v_items ->> label) ~ '^\d+$'
    and (
      select count(*)
      from jsonb_array_elements(v_claims) as existing_claim(claim)
      cross join jsonb_array_elements_text(coalesce(existing_claim.claim -> 'wanted', '[]'::jsonb)) as existing_wanted(value)
      where upper(trim(existing_wanted.value)) = label
    ) < (v_items ->> label)::int;

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

revoke all on function public.olivia_panini_submit_trade_claim(text, text, text[], text[]) from public;
grant execute on function public.olivia_panini_submit_trade_claim(text, text, text[], text[]) to anon, authenticated;
