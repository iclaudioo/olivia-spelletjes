drop policy if exists olivia_panini_state_insert on public.olivia_panini_state;
drop policy if exists olivia_panini_state_read on public.olivia_panini_state;
drop policy if exists olivia_panini_state_update on public.olivia_panini_state;

revoke all on public.olivia_panini_state from anon, authenticated;
