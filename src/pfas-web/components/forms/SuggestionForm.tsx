'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui';
import styles from './Forms.module.css';

interface FormData {
  productName: string;
  brand: string;
  category: string;
  whereToBuy: string;
  whyPfasFree: string;
  email: string;
  honeypot: string;
}

const CATEGORIES = [
  { value: '', label: 'Select a category...' },
  { value: 'cookware', label: 'Cookware (pans, pots)' },
  { value: 'bakeware', label: 'Bakeware' },
  { value: 'food-storage', label: 'Food Storage' },
  { value: 'utensils', label: 'Utensils & Tools' },
  { value: 'appliances', label: 'Small Appliances' },
  { value: 'tableware', label: 'Tableware' },
  { value: 'food-prep', label: 'Food Prep' },
  { value: 'other', label: 'Other' },
];

export function SuggestionForm() {
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    brand: '',
    category: '',
    whereToBuy: '',
    whyPfasFree: '',
    email: '',
    honeypot: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    if (!formData.productName.trim() || !formData.brand.trim()) {
      setErrorMessage('Please fill in all required fields.');
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
      console.log('Product suggestion submitted:', formData);
      
      setStatus('success');
      setFormData({
        productName: '',
        brand: '',
        category: '',
        whereToBuy: '',
        whyPfasFree: '',
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
          We&apos;ve received your product suggestion. Our team will review it and 
          add it to our research queue. We appreciate your help in building a 
          comprehensive PFAS-free product database.
        </p>
        <Button onClick={() => setStatus('idle')} variant="outline" size="md">
          Submit Another Suggestion
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Honeypot field - hidden from humans */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="honeypot"
          value={formData.honeypot}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="productName" className={styles.label}>
          Product Name <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="productName"
          name="productName"
          value={formData.productName}
          onChange={handleChange}
          placeholder="e.g., 10-inch Ceramic Frying Pan"
          className={styles.input}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="brand" className={styles.label}>
          Brand <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="brand"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="e.g., GreenPan"
          className={styles.input}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="category" className={styles.label}>
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={styles.select}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="whereToBuy" className={styles.label}>
          Where to Buy (URL)
        </label>
        <input
          type="url"
          id="whereToBuy"
          name="whereToBuy"
          value={formData.whereToBuy}
          onChange={handleChange}
          placeholder="https://www.amazon.com/..."
          className={styles.input}
        />
        <p className={styles.helpText}>
          Link to the product on a retailer website
        </p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="whyPfasFree" className={styles.label}>
          Why do you think it&apos;s PFAS-free?
        </label>
        <textarea
          id="whyPfasFree"
          name="whyPfasFree"
          value={formData.whyPfasFree}
          onChange={handleChange}
          placeholder="e.g., The brand states it's PFAS-free on their website..."
          className={styles.textarea}
          rows={4}
        />
        <p className={styles.helpText}>
          Any information you have about why this product should be considered PFAS-free
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
          If you&apos;d like to be notified when we review this product
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
          {status === 'submitting' ? 'Submitting...' : 'Submit Suggestion'}
        </Button>
      </div>

      <p className={styles.privacyNote}>
        We&apos;ll only use your email to notify you about this suggestion. 
        See our <a href="/privacy">Privacy Policy</a>.
      </p>
    </form>
  );
}

export default SuggestionForm;
