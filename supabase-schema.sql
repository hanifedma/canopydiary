-- CanopyDiary Supabase setup.
-- Run this once in the Supabase SQL editor for your project.

create table if not exists public.diary_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  title text not null default '',
  text text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

alter table public.diary_notes enable row level security;

drop policy if exists "Users can read own diary notes" on public.diary_notes;
create policy "Users can read own diary notes"
on public.diary_notes for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own diary notes" on public.diary_notes;
create policy "Users can create own diary notes"
on public.diary_notes for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own diary notes" on public.diary_notes;
create policy "Users can update own diary notes"
on public.diary_notes for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own diary notes" on public.diary_notes;
create policy "Users can delete own diary notes"
on public.diary_notes for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.diary_images (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  storage_path text not null unique,
  name text not null default 'Diary picture',
  size integer not null default 0,
  original_size integer not null default 0,
  content_type text not null default '',
  width integer,
  height integer,
  uploaded_at timestamptz not null default now()
);

create index if not exists diary_images_user_date_uploaded_idx
on public.diary_images (user_id, date desc, uploaded_at desc);

alter table public.diary_images enable row level security;

drop policy if exists "Users can read own diary images" on public.diary_images;
create policy "Users can read own diary images"
on public.diary_images for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own diary images" on public.diary_images;
create policy "Users can create own diary images"
on public.diary_images for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own diary images" on public.diary_images;
create policy "Users can update own diary images"
on public.diary_images for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own diary images" on public.diary_images;
create policy "Users can delete own diary images"
on public.diary_images for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'diary-images',
  'diary-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

drop policy if exists "Diary image objects are readable by owner" on storage.objects;
create policy "Diary image objects are readable by owner"
on storage.objects for select
to authenticated
using (
  bucket_id = 'diary-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Diary image objects are creatable by owner" on storage.objects;
create policy "Diary image objects are creatable by owner"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'diary-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Diary image objects are updatable by owner" on storage.objects;
create policy "Diary image objects are updatable by owner"
on storage.objects for update
to authenticated
using (
  bucket_id = 'diary-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'diary-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Diary image objects are deletable by owner" on storage.objects;
create policy "Diary image objects are deletable by owner"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'diary-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'diary_notes'
    ) then
      alter publication supabase_realtime add table public.diary_notes;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'diary_images'
    ) then
      alter publication supabase_realtime add table public.diary_images;
    end if;
  end if;
end $$;
