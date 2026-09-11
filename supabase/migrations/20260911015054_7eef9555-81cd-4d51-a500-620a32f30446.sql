CREATE POLICY "Authenticated users read case files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'case-files');
CREATE POLICY "Authenticated users upload case files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'case-files');
CREATE POLICY "Authenticated users update case files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'case-files') WITH CHECK (bucket_id = 'case-files');
CREATE POLICY "Authenticated users delete case files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'case-files');