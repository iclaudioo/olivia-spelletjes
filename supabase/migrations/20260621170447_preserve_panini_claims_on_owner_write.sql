create or replace function public.olivia_panini_preserve_trade_claims(p_existing jsonb, p_incoming jsonb)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  v_out jsonb := coalesce(p_incoming, '{}'::jsonb);
  v_existing_shares jsonb := coalesce(p_existing -> 'tradeShares', '{}'::jsonb);
  v_incoming_shares jsonb := coalesce(v_out -> 'tradeShares', '{}'::jsonb);
  v_share_id text;
  v_existing_share jsonb;
  v_incoming_share jsonb;
  v_claim jsonb;
  v_existing_claim jsonb;
  v_claim_key text;
  v_claims_by_friend jsonb;
  v_claims jsonb;
  v_updated_at text;
begin
  for v_share_id, v_existing_share in
    select key, value from jsonb_each(v_existing_shares)
  loop
    v_incoming_share := v_incoming_shares -> v_share_id;

    if v_incoming_share is null then
      v_incoming_shares := jsonb_set(v_incoming_shares, array[v_share_id], v_existing_share, true);
      continue;
    end if;

    v_claims_by_friend := '{}'::jsonb;

    for v_claim in
      select value from jsonb_array_elements(coalesce(v_existing_share -> 'claims', '[]'::jsonb))
    loop
      v_claim_key := lower(trim(coalesce(v_claim ->> 'friendName', '')));
      if v_claim_key <> '' then
        v_claims_by_friend := jsonb_set(v_claims_by_friend, array[v_claim_key], v_claim, true);
      end if;
    end loop;

    for v_claim in
      select value from jsonb_array_elements(coalesce(v_incoming_share -> 'claims', '[]'::jsonb))
    loop
      v_claim_key := lower(trim(coalesce(v_claim ->> 'friendName', '')));
      if v_claim_key <> '' then
        v_existing_claim := v_claims_by_friend -> v_claim_key;
        if v_existing_claim is null
          or coalesce(v_claim ->> 'updatedAt', '') >= coalesce(v_existing_claim ->> 'updatedAt', '')
        then
          v_claims_by_friend := jsonb_set(v_claims_by_friend, array[v_claim_key], v_claim, true);
        end if;
      end if;
    end loop;

    select coalesce(jsonb_agg(value order by value ->> 'friendName'), '[]'::jsonb)
    into v_claims
    from jsonb_each(v_claims_by_friend);

    v_updated_at := greatest(
      coalesce(v_existing_share ->> 'updatedAt', ''),
      coalesce(v_incoming_share ->> 'updatedAt', '')
    );

    v_incoming_share := jsonb_set(v_incoming_share, '{claims}', v_claims, true);
    if v_updated_at <> '' then
      v_incoming_share := jsonb_set(v_incoming_share, '{updatedAt}', to_jsonb(v_updated_at), true);
    end if;

    v_incoming_shares := jsonb_set(v_incoming_shares, array[v_share_id], v_incoming_share, true);
  end loop;

  return jsonb_set(v_out, '{tradeShares}', v_incoming_shares, true);
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
  v_existing_state jsonb;
begin
  if not public.olivia_panini_has_owner_access(p_owner_token) then
    raise exception 'invalid owner token' using errcode = '28000';
  end if;

  if not public.olivia_panini_validate_state(v_state) then
    raise exception 'invalid panini state' using errcode = '22023';
  end if;

  select state
  into v_existing_state
  from public.olivia_panini_state
  where id = 'olivia'
  for update;

  if v_existing_state is not null then
    v_state := public.olivia_panini_preserve_trade_claims(v_existing_state, v_state);
  end if;

  insert into public.olivia_panini_state (id, state, updated_at)
  values ('olivia', v_state, now())
  on conflict (id) do update
  set state = excluded.state,
      updated_at = now();

  return v_state;
end;
$$;

revoke all on function public.olivia_panini_preserve_trade_claims(jsonb, jsonb) from public;
revoke all on function public.olivia_panini_write_state(text, jsonb) from public;
grant execute on function public.olivia_panini_write_state(text, jsonb) to anon, authenticated;
