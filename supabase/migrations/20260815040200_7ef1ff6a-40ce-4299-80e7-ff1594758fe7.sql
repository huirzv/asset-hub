-- quarantine: owner-only read, owner write into own folder
create policy "quarantine_owner_read" on storage.objects for select to authenticated
  using (bucket_id = 'asset-quarantine' and (auth.uid()::text = (storage.foldername(name))[1] or public.has_role(auth.uid(),'admin')));
create policy "quarantine_owner_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'asset-quarantine' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "quarantine_owner_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'asset-quarantine' and auth.uid()::text = (storage.foldername(name))[1]);

-- thumbnails + previews: readable by everyone, writable in own folder only
create policy "public_media_read" on storage.objects for select
  using (bucket_id in ('asset-thumbnails','asset-previews'));
create policy "public_media_write" on storage.objects for insert to authenticated
  with check (bucket_id in ('asset-thumbnails','asset-previews') and auth.uid()::text = (storage.foldername(name))[1]);
create policy "public_media_update" on storage.objects for update to authenticated
  using (bucket_id in ('asset-thumbnails','asset-previews') and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id in ('asset-thumbnails','asset-previews') and auth.uid()::text = (storage.foldername(name))[1]);
create policy "public_media_delete" on storage.objects for delete to authenticated
  using (bucket_id in ('asset-thumbnails','asset-previews') and auth.uid()::text = (storage.foldername(name))[1]);