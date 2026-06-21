create or replace function public.olivia_panini_missing_labels(p_state jsonb)
returns jsonb
language sql
stable
set search_path = public
as $$
  with team_missing as (
    select team_order, team_code || ' ' || sticker_number as label
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
    )
  ),
  extra_missing as (
    select 1000 + extra_order as team_order, extra_code as label
    from (
      values
        (1, '00', 'owned'),
        (2, 'FWC 1', 'missing'),
        (3, 'FWC 2', 'missing'),
        (4, 'FWC 3', 'missing'),
        (5, 'FWC 4', 'owned'),
        (6, 'FWC 5', 'owned'),
        (7, 'FWC 6', 'check'),
        (8, 'FWC 7', 'missing'),
        (9, 'FWC 8', 'missing'),
        (10, 'FWC 9', 'missing'),
        (11, 'FWC 10', 'owned'),
        (12, 'FWC 11', 'missing'),
        (13, 'FWC 12', 'missing'),
        (14, 'FWC 13', 'missing'),
        (15, 'FWC 14', 'missing'),
        (16, 'FWC 15', 'missing'),
        (17, 'FWC 16', 'owned'),
        (18, 'FWC 17', 'owned'),
        (19, 'FWC 18', 'missing'),
        (20, 'FWC 19', 'missing')
    ) as extras(extra_order, extra_code, default_status)
    where coalesce(p_state #>> array['extras', extra_code], default_status) <> 'owned'
  )
  select coalesce(jsonb_agg(label order by team_order, label), '[]'::jsonb)
  from (
    select team_order, label from team_missing
    union all
    select team_order, label from extra_missing
  ) labels;
$$;

revoke all on function public.olivia_panini_missing_labels(jsonb) from public;
revoke execute on function public.olivia_panini_missing_labels(jsonb) from anon, authenticated;
