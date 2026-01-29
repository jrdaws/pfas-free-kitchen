'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './upload.module.css';

export default function EvidenceUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [type, setType] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Calculate SHA-256 hash
    const buffer = await selectedFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    setHash(hashHex);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !type) return;

    setUploading(true);
    // STUB: Upload to API
    await new Promise((r) => setTimeout(r, 1000));
    setUploading(false);
    alert('Upload complete (stub)');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/evidence" className={styles.backLink}>← Back to Evidence</Link>
        <h1 className={styles.title}>Upload Evidence</h1>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Step 1: File Upload */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Step 1: Select File</h2>
          <div className={styles.dropzone}>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className={styles.fileInput}
              id="file-upload"
            />
            <label htmlFor="file-upload" className={styles.dropzoneLabel}>
              <span className={styles.dropzoneIcon}>📄</span>
              <span>Drop file here or click to browse</span>
              <span className={styles.dropzoneHint}>PDF, PNG, JPG up to 10MB</span>
            </label>
          </div>

          {file && (
            <div className={styles.fileInfo}>
              <p>✓ <strong>{file.name}</strong> ({formatBytes(file.size)})</p>
              <p className={styles.hashInfo}>
                SHA-256: <code>{hash}</code>
              </p>
            </div>
          )}
        </section>

        {/* Step 2: Type Selection */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Step 2: Evidence Type</h2>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={styles.select}
            required
          >
            <option value="">Select type...</option>
            <option value="lab_report">Lab Report</option>
            <option value="brand_statement">Brand Statement</option>
            <option value="policy_document">Policy Document</option>
            <option value="screenshot">Screenshot</option>
            <option value="certification">Certification</option>
            <option value="other">Other</option>
          </select>
        </section>

        {/* Step 3: Metadata */}
        {type && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Step 3: Metadata</h2>
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Title</label>
                <input type="text" placeholder="e.g., Lodge PFAS-Free Statement 2024" required />
              </div>

              {type === 'lab_report' && (
                <>
                  <div className={styles.field}>
                    <label>Lab Name</label>
                    <input type="text" placeholder="e.g., SGS" />
                  </div>
                  <div className={styles.field}>
                    <label>Report Date</label>
                    <input type="date" />
                  </div>
                  <div className={styles.field}>
                    <label>Test Method</label>
                    <input type="text" placeholder="e.g., EPA 533" />
                  </div>
                </>
              )}

              {type === 'screenshot' && (
                <div className={styles.field}>
                  <label>Source URL</label>
                  <input type="url" placeholder="https://..." />
                </div>
              )}

              <div className={styles.field}>
                <label>Notes</label>
                <textarea rows={3} placeholder="Any additional context..." />
              </div>
            </div>
          </section>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Link href="/evidence" className="btn btn-ghost">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!file || !type || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Evidence'}
          </button>
        </div>
      </form>
    </div>
  );
}
