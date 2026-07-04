-- Buat bucket 'avatars' untuk logo bisnis (public)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Izinkan user upload file ke folder miliknya sendiri
create policy "User dapat upload logo sendiri"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Izinkan user melihat semua logo (public bucket)
create policy "Semua orang bisa lihat logo"
on storage.objects for select
to public
using (bucket_id = 'avatars');
