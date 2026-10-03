-- Enable Reports for every role shown in the permissions matrix.
-- Later changes made by Super Admin remain editable.
insert into public.em_role_page_access (role, page_key, allowed)
values
  ('admin1', 'reports', true),
  ('user4', 'reports', true),
  ('demo', 'reports', true),
  ('user', 'reports', true),
  ('admin', 'reports', true)
on conflict (role, page_key) do update set allowed = excluded.allowed;
