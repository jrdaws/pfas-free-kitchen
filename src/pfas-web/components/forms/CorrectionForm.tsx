'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui';
import styles from './Forms.module.css';

interface FormData {
  pageUrl: string;
  errorDescription: string;
  correctInfo: string;
  source: string;
  email: string;
  honeypot: string;
}

export function CorrectionForm() {
  const [formData, setFormData] = useState<FormData>({
    pageUrl: '',
    errorDescription: '',
    correctInfo: '',
    source: '',
    email: '',
    honeypot: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Honeypot check (spam prevention)
    if (formData.honeypot) {
      setStatus('success'); // Fake success for bots
      return;
    }

    // Basic validation
    if (!formData.pageUrl.trim() || !formData.errorDescription.trim()) {
      setErrorMessage('Please provide the page URL and describe the error.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      // In a real implementation, this would POST to an API
      // For now, simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Log to console for demo purposes
      console.log('Correction submitted:', formData);
      
      setStatus('success');
      setFormData({
        pageUrl: '',
        errorDescription: '',
        correctInfo: '',
        source: '',
        email: '',
        honeypot: '',
      });
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again later.');
    }
  };

  if (status === 'success') {
    return (
      <div className={styles.successMessage}>
        <div className={styles.successIcon}>✓</div>
        <h3>Thank You!</h3>
        <p>
          We&apos;ve received your correction report. Our team will review it and 
          make updates as needed. We aim to respond to error reports within 1-2 
          business days.
        </p>
        <p>
          Accuracy is extremely important to us, and we appreciate your help 
          in maintaining the quality of our information.
        </p>
        <Button onClick={() => setStatus('idle')} variant="outline" size="md">
          Report Another Issue
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Honeypot field - hidden from humans */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          type="text"
          id="company"
          name="honeypot"
          value={formData.honeypot}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="pageUrl" className={styles.label}>
          Page URL with Error <span className={styles.required}>*</span>
        </label>
        <input
          type="url"
          id="pageUrl"
          name="pageUrl"
          value={formData.pageUrl}
          onChange={handleChange}
          placeholder="https://pfasfreekitchen.com/products/..."
          className={styles.input}
          required
        />
        <p className={styles.helpText}>
          Copy the URL from your browser address bar
        </p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="errorDescription" className={styles.label}>
          Describe the Error <span className={styles.required}>*</span>
        </label>
        <textarea
          id="errorDescription"
          name="errorDescription"
          value={formData.errorDescription}
          onChange={handleChange}
          placeholder="e.g., The product page says this pan is ceramic, but it's actually hard-anodized aluminum..."
          className={styles.textarea}
          rows={4}
          required
        />
        <p className={styles.helpText}>
          Please be as specific as possible about what information is incorrect
        </p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="correctInfo" className={styles.label}>
          Correct Information (if known)
        </label>
        <textarea
          id="correctInfo"
          name="correctInfo"
          value={formData.correctInfo}
          onChange={handleChange}
          placeholder="e.g., According to the manufacturer's website, the pan is made of..."
          className={styles.textarea}
          rows={3}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="source" className={styles.label}>
          Source for Correct Information
        </label>
        <input
          type="text"
          id="source"
          name="source"
          value={formData.source}
          onChange={handleChange}
          placeholder="e.g., https://manufacturer.com/product-specs or 'I spoke with customer service'"
          className={styles.input}
        />
        <p className={styles.helpText}>
          URL or description of where you found the correct information
        </p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Your Email (optional)
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className={styles.input}
        />
        <p className={styles.helpText}>
          If you&apos;d like us to follow up with you about this correction
        </p>
      </div>

      {status === 'error' && errorMessage && (
        <div className={styles.errorMessage}>
          {errorMessage}
        </div>
      )}

      <div className={styles.formActions}>
        <Button 
          type="submit" 
          size="lg"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit Correction'}
        </Button>
      </div>

      <p className={styles.privacyNote}>
        We&apos;ll only use your email to follow up about this correction. 
        See our <a href="/privacy">Privacy Policy</a>.
      </p>
    </form>
  );
}

export default CorrectionForm;
