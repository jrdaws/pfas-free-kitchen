# Storage Integrations

Store and serve files with Supabase Storage.

## Available Providers

| Provider | Best For | Features | Setup |
|----------|----------|----------|-------|
| **Supabase** | PostgreSQL-integrated storage | File uploads, image transformations, CDN, Row Level Security | [Guide →](supabase.md) |

## Why Supabase Storage

Supabase Storage provides scalable file storage with powerful features:

✅ **Integrated with auth** - Use RLS for access control
✅ **Image transformations** - Resize, optimize on-the-fly
✅ **CDN delivery** - Fast file serving globally
✅ **Public & private buckets** - Control file visibility
✅ **Resumable uploads** - Handle large files
✅ **Signed URLs** - Temporary access links
✅ **Built-in optimizer** - Auto-compress images
✅ **Free tier** - 1GB storage, 2GB bandwidth

## Quick Start

### 1. Create Storage Bucket

In Supabase dashboard:
1. Go to **Storage**
2. Click **New bucket**
3. Name: `avatars` or `uploads`
4. Set public/private
5. Create bucket

### 2. Set Up RLS Policies

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow public access to read files
CREATE POLICY "Files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

### 3. Upload File

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(data.path)
```

## Common Use Cases

### User Avatars

Store profile pictures:

```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file, {
    cacheControl: '3600',
    upsert: true // Replace if exists
  })
```

### Document Storage

Store PDFs, documents:

```typescript
await supabase.storage
  .from('documents')
  .upload(`${userId}/resume.pdf`, file, {
    contentType: 'application/pdf'
  })
```

### Image Gallery

Store multiple images:

```typescript
// Upload
await supabase.storage
  .from('gallery')
  .upload(`user/${userId}/photo-${Date.now()}.jpg`, file)

// List all user images
const { data: files } = await supabase.storage
  .from('gallery')
  .list(`user/${userId}`)
```

### Private Files

Secure file access with signed URLs:

```typescript
const { data, error } = await supabase.storage
  .from('private-docs')
  .createSignedUrl('document.pdf', 60) // 60 seconds

// Share temporary URL
const downloadUrl = data.signedUrl
```

## Integration Patterns

### File Upload Component

```typescript
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'

export default function FileUpload() {
  const [uploading, setUploading] = useState(false)
  const supabase = createClientComponentClient()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(`${Date.now()}-${file.name}`, file)

    if (error) {
      alert('Upload failed')
    } else {
      alert('Upload successful!')
    }

    setUploading(false)
  }

  return (
    <input
      type="file"
      onChange={handleUpload}
      disabled={uploading}
    />
  )
}
```

### With Database Records

Link uploaded files to database:

```typescript
// 1. Upload file
const { data: fileData } = await supabase.storage
  .from('documents')
  .upload(filePath, file)

// 2. Save to database
await supabase.from('documents').insert({
  user_id: userId,
  file_path: fileData.path,
  file_name: file.name,
  file_size: file.size,
  file_type: file.type
})
```

### Image Transformations

Resize images on-the-fly:

```typescript
// Original URL
const publicUrl = supabase.storage
  .from('avatars')
  .getPublicUrl('avatar.jpg').data.publicUrl

// Transformed URL (300x300)
const transformedUrl = `${publicUrl}?width=300&height=300`
```

## Security

### Row Level Security

```sql
-- Users can only access their own files
CREATE POLICY "Users access own files"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'private' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Anyone can view public files
CREATE POLICY "Public files are viewable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'public');
```

### File Size Limits

```typescript
// Validate file size before upload
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

if (file.size > MAX_FILE_SIZE) {
  alert('File too large')
  return
}
```

### File Type Validation

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

if (!ALLOWED_TYPES.includes(file.type)) {
  alert('Invalid file type')
  return
}
```

## Performance

### CDN Delivery

Files automatically served via CDN for fast global access.

### Image Optimization

```typescript
// Auto-optimize images
const optimizedUrl = `${publicUrl}?width=800&quality=75&format=webp`
```

### Lazy Loading

```typescript
<img
  src={imageUrl}
  loading="lazy"
  alt="User avatar"
/>
```

## Common Issues

### Upload Fails

**Solutions:**
1. Check file size limits
2. Verify bucket exists
3. Check RLS policies
4. Validate file type

### Files Not Accessible

**Solutions:**
1. Check bucket is public (if needed)
2. Verify RLS policies
3. Use signed URLs for private files

### Slow Uploads

**Solutions:**
1. Compress files before upload
2. Use resumable uploads for large files
3. Optimize images client-side

## Next Steps

- [Complete Supabase Storage Guide](supabase.md) - Detailed setup
- [Database Integration](../database/supabase.md) - Link files to data
- [Authentication](../auth/supabase.md) - Secure file access
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage) - Official docs

## Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Security Policies](https://supabase.com/docs/guides/storage/security/access-control)
