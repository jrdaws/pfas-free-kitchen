# Supabase Storage Setup

Complete guide to setting up Supabase Storage for file uploads and management.

## What It Does

Supabase Storage provides scalable object storage with:

- File uploads (images, documents, videos, etc.)
- Public and private buckets
- Row Level Security (RLS) integration
- Image transformations (resize, optimize)
- CDN delivery for fast access
- Signed URLs for temporary access
- Resumable uploads for large files
- Direct uploads from client
- Auto-optimization for images
- Free tier: 1GB storage, 2GB bandwidth/month

## Prerequisites

- [ ] Supabase project created
- [ ] Supabase Auth set up (for private files)
- [ ] Environment variables configured

## Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Step-by-Step Setup

### 1. Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Configure bucket:
   - **Name:** `avatars` (or your choice)
   - **Public bucket:** Check if files should be publicly accessible
   - Click **Create bucket**

Common bucket names:
- `avatars` - User profile pictures
- `documents` - PDFs, files
- `gallery` - User-uploaded images
- `private` - Secure files

### 2. Configure Storage Policies

Go to **Storage** → Select bucket → **Policies**

For public avatars:

```sql
-- Allow anyone to view avatar files
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

For private documents:

```sql
-- Users can only access their own files
CREATE POLICY "Users can access own documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. Create Upload Component

```typescript
// components/avatar-upload.tsx
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import Image from 'next/image'

export default function AvatarUpload({ userId, currentAvatar }: {
  userId: string
  currentAvatar?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [avatar, setAvatar] = useState(currentAvatar)
  const supabase = createClientComponentClient()

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)

      const file = event.target.files?.[0]
      if (!file) return

      // Validate file
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      // Upload to Supabase
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/avatar.${fileExt}`

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatar(publicUrl)

      // Update profile in database
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      alert('Avatar uploaded!')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error uploading avatar')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {avatar && (
        <Image
          src={avatar}
          alt="Avatar"
          width={100}
          height={100}
          className="rounded-full"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading}
      />

      {uploading && <p>Uploading...</p>}
    </div>
  )
}
```

## Code Examples

### Upload File

```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .upload('folder/file.pdf', file, {
    cacheControl: '3600',
    upsert: false // Don't replace if exists
  })
```

### Upload with Progress

```typescript
const { data, error } = await supabase.storage
  .from('uploads')
  .upload('large-file.zip', file, {
    cacheControl: '3600',
    onUploadProgress: (progress) => {
      const percent = (progress.loaded / progress.total) * 100
      console.log(`Upload progress: ${percent}%`)
      setProgress(percent)
    }
  })
```

### Download File

```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .download('folder/file.pdf')

// Create blob URL
const url = URL.createObjectURL(data)

// Trigger download
const link = document.createElement('a')
link.href = url
link.download = 'file.pdf'
link.click()
```

### Get Public URL

```typescript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-123/avatar.jpg')

const publicUrl = data.publicUrl
```

### Create Signed URL

For private files with temporary access:

```typescript
const { data, error } = await supabase.storage
  .from('private')
  .createSignedUrl('secret-document.pdf', 60) // 60 seconds

// Share this URL
const signedUrl = data.signedUrl
```

### List Files

```typescript
// List files in folder
const { data, error } = await supabase.storage
  .from('documents')
  .list('user-123', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  })

// data contains array of files
data.forEach(file => {
  console.log(file.name, file.created_at, file.metadata?.size)
})
```

### Delete File

```typescript
const { error } = await supabase.storage
  .from('avatars')
  .remove(['user-123/avatar.jpg'])
```

### Move File

```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .move('old-path/file.pdf', 'new-path/file.pdf')
```

### Copy File

```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .copy('original/file.pdf', 'backup/file.pdf')
```

### Update File

```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .update('user-123/avatar.jpg', newFile, {
    cacheControl: '3600',
    upsert: true
  })
```

## Image Transformations

### Resize Image

```typescript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('avatar.jpg')

// Add transformation parameters
const resizedUrl = `${data.publicUrl}?width=300&height=300`
```

### Available Transformations

```typescript
// Width and height
`${publicUrl}?width=500&height=500`

// Quality (1-100)
`${publicUrl}?quality=75`

// Format (webp, jpg, png)
`${publicUrl}?format=webp`

// Resize mode (cover, contain, fill)
`${publicUrl}?resize=cover`

// Combined
`${publicUrl}?width=500&height=500&quality=75&format=webp`
```

### Responsive Images

```typescript
<picture>
  <source
    srcSet={`${publicUrl}?width=800&format=webp`}
    type="image/webp"
  />
  <img
    src={`${publicUrl}?width=800`}
    alt="Image"
    loading="lazy"
  />
</picture>
```

## Advanced Features

### Multiple File Upload

```typescript
'use client'

import { useState } from 'react'

export default function MultiFileUpload() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)

  async function uploadFiles() {
    if (!files) return

    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        const filePath = `uploads/${Date.now()}-${file.name}`

        const { error } = await supabase.storage
          .from('gallery')
          .upload(filePath, file)

        if (error) throw error
      }

      alert('All files uploaded!')
    } catch (error) {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
      />
      <button onClick={uploadFiles} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Files'}
      </button>
    </div>
  )
}
```

### Resumable Upload (Large Files)

```typescript
import { SupabaseClient } from '@supabase/supabase-js'

async function resumableUpload(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  file: File
) {
  const chunkSize = 6 * 1024 * 1024 // 6MB chunks

  for (let start = 0; start < file.size; start += chunkSize) {
    const chunk = file.slice(start, start + chunkSize)

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, chunk, {
        upsert: true
      })

    if (error) throw error
  }
}
```

### Direct Upload from Client

```typescript
// Upload directly from browser without going through your server
export default function DirectUpload() {
  async function handleUpload(file: File) {
    // Get signed upload URL
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .createSignedUploadUrl(`files/${Date.now()}-${file.name}`)

    if (uploadError) throw uploadError

    // Upload file using signed URL
    const response = await fetch(uploadData.signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    })

    if (!response.ok) throw new Error('Upload failed')

    // Use uploadData.path to get the file later
    console.log('File uploaded:', uploadData.path)
  }

  return <input type="file" onChange={(e) => handleUpload(e.target.files![0])} />
}
```

### Link Files to Database

```typescript
// 1. Create database table
CREATE TABLE user_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

// 2. Upload file and save to database
async function uploadAndTrack(file: File, userId: string) {
  // Upload to storage
  const filePath = `${userId}/${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file)

  if (error) throw error

  // Save metadata to database
  await supabase.from('user_files').insert({
    user_id: userId,
    file_path: data.path,
    file_name: file.name,
    file_size: file.size,
    file_type: file.type
  })
}

// 3. Fetch user's files
const { data: userFiles } = await supabase
  .from('user_files')
  .select('*')
  .eq('user_id', userId)
  .order('uploaded_at', { ascending: false })
```

## Security Best Practices

### Validate File Types

```typescript
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword']

function validateFileType(file: File, allowedTypes: string[]) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed`)
  }
}
```

### Validate File Size

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function validateFileSize(file: File, maxSize: number) {
  if (file.size > maxSize) {
    throw new Error(`File size ${file.size} exceeds ${maxSize}`)
  }
}
```

### Sanitize File Names

```typescript
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}
```

### Use UUID for File Names

```typescript
import { v4 as uuidv4 } from 'uuid'

const fileExt = file.name.split('.').pop()
const fileName = `${uuidv4()}.${fileExt}`
const filePath = `${userId}/${fileName}`
```

## Testing

### Test File Upload

```typescript
import { createClient } from '@supabase/supabase-js'

describe('Storage', () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  it('should upload file', async () => {
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })

    const { data, error } = await supabase.storage
      .from('test-bucket')
      .upload('test/test.txt', testFile)

    expect(error).toBeNull()
    expect(data).toBeDefined()

    // Clean up
    await supabase.storage
      .from('test-bucket')
      .remove(['test/test.txt'])
  })
})
```

## Common Issues

### Upload Fails with "Bucket not found"

**Solution:** Create bucket in Supabase dashboard first.

### Upload Fails with "Policy violation"

**Solution:** Check RLS policies on storage.objects table.

### Files Not Accessible

**Solution:**
1. For public files: Ensure bucket is public
2. For private files: Use signed URLs
3. Check RLS policies

### Image Transformations Not Working

**Solution:**
1. Only works on public buckets
2. Verify URL format is correct
3. Check file is actually an image

## Production Checklist

- [ ] Storage buckets created
- [ ] RLS policies configured
- [ ] File validation implemented
- [ ] File size limits enforced
- [ ] File types restricted
- [ ] Image optimization enabled
- [ ] CDN delivery verified
- [ ] Error handling in place
- [ ] Progress indicators added
- [ ] Cleanup for failed uploads

## Next Steps

- [Database Integration](../database/supabase.md) - Link files to database
- [Authentication](../auth/supabase.md) - Secure file access
- [Email Integration](../email/resend.md) - Send upload notifications
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage) - Official docs

## Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Image Transformations Guide](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Access Control Guide](https://supabase.com/docs/guides/storage/security/access-control)
- [CDN Guide](https://supabase.com/docs/guides/storage/cdn)
