'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { submitReport } from '@/lib/data';
import styles from './report.module.css';

type IssueType = 'suspected_pfas' | 'materials_changed' | 'listing_mismatch' | 'counterfeit_risk' | 'other';

const ISSUE_TYPES: { value: IssueType; label: string; description: string }[] = [
  {
    value: 'suspected_pfas',
    label: 'Suspected PFAS Content',
    description: 'You have evidence or reason to believe this product contains PFAS',
  },
  {
    value: 'materials_changed',
    label: 'Materials Changed',
    description: 'The manufacturer has changed materials or formulation',
  },
  {
    value: 'listing_mismatch',
    label: 'Listing Mismatch',
    description: 'Product information doesn\'t match the actual product',
  },
  {
    value: 'counterfeit_risk',
    label: 'Counterfeit Risk',
    description: 'Concerns about counterfeit products from certain retailers',
  },
  {
    value: 'other',
    label: 'Other Issue',
    description: 'Report a different type of issue with our information',
  },
];

export default function ReportPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  const { success, error: showError } = useToast();

  const [formState, setFormState] = useState({
    productId: productId || '',
    issueType: '' as IssueType | '',
    description: '',
    evidenceUrls: '',
    contactEmail: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.issueType || !formState.description.trim()) {
      showError('Please fill out all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const evidenceUrls = formState.evidenceUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      await submitReport({
        productId: formState.productId || 'general',
        issueType: formState.issueType as IssueType,
        description: formState.description.trim(),
        evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
        contactEmail: formState.contactEmail.trim() || undefined,
      });

      success('Report submitted successfully! We\'ll review it within 48 hours.');
      setIsSubmitted(true);
    } catch (err) {
      console.error('Report submission error:', err);
      showError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={styles.page}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>✓</div>
          <h1>Report Submitted</h1>
          <p>
            Thank you for helping us maintain accurate information. Our team will 
            review your report and take appropriate action.
          </p>
          <p className={styles.timeline}>
            <strong>Expected response time:</strong> Within 48 hours
          </p>
          <div className={styles.successActions}>
            <Link href="/search">
              <Button>Continue Browsing</Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsSubmitted(false);
                setFormState({
                  productId: '',
                  issueType: '',
                  description: '',
                  evidenceUrls: '',
                  contactEmail: '',
                });
              }}
            >
              Submit Another Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Report an Issue</h1>
        <p>
          Help us maintain accurate information by reporting issues with our product 
          data or verification. All reports are reviewed by our research team.
        </p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form} data-testid="report-form">
        {/* Product ID (optional, prefilled from query param) */}
        <div className={styles.field}>
          <label htmlFor="productId" className={styles.label}>
            Product ID <span className={styles.optional}>(optional)</span>
          </label>
          <input
            type="text"
            id="productId"
            value={formState.productId}
            onChange={(e) => setFormState(prev => ({ ...prev, productId: e.target.value }))}
            placeholder="e.g., lodge-cast-iron-skillet-10"
            className={styles.input}
          />
          <p className={styles.hint}>
            If reporting about a specific product, enter its ID or leave blank for general reports
          </p>
        </div>

        {/* Issue Type */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>
            Issue Type <span className={styles.required}>*</span>
          </legend>
          <div className={styles.radioGroup}>
            {ISSUE_TYPES.map((type) => (
              <label 
                key={type.value} 
                className={`${styles.radioCard} ${formState.issueType === type.value ? styles.selected : ''}`}
              >
                <input
                  type="radio"
                  name="issueType"
                  value={type.value}
                  checked={formState.issueType === type.value}
                  onChange={(e) => setFormState(prev => ({ ...prev, issueType: e.target.value as IssueType }))}
                  className={styles.radioInput}
                />
                <span className={styles.radioContent}>
                  <span className={styles.radioLabel}>{type.label}</span>
                  <span className={styles.radioDescription}>{type.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Description */}
        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            Description <span className={styles.required}>*</span>
          </label>
          <textarea
            id="description"
            value={formState.description}
            onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Please describe the issue in detail. Include any relevant context, dates, or sources."
            className={styles.textarea}
            rows={5}
            required
          />
        </div>

        {/* Evidence URLs */}
        <div className={styles.field}>
          <label htmlFor="evidenceUrls" className={styles.label}>
            Evidence URLs <span className={styles.optional}>(optional)</span>
          </label>
          <textarea
            id="evidenceUrls"
            value={formState.evidenceUrls}
            onChange={(e) => setFormState(prev => ({ ...prev, evidenceUrls: e.target.value }))}
            placeholder="https://example.com/source1&#10;https://example.com/source2"
            className={styles.textarea}
            rows={3}
          />
          <p className={styles.hint}>
            Enter one URL per line. Include links to documentation, lab reports, or other evidence.
          </p>
        </div>

        {/* Contact Email */}
        <div className={styles.field}>
          <label htmlFor="contactEmail" className={styles.label}>
            Contact Email <span className={styles.optional}>(optional)</span>
          </label>
          <input
            type="email"
            id="contactEmail"
            value={formState.contactEmail}
            onChange={(e) => setFormState(prev => ({ ...prev, contactEmail: e.target.value }))}
            placeholder="your@email.com"
            className={styles.input}
          />
          <p className={styles.hint}>
            Provide your email if you&apos;d like us to follow up with you about this report
          </p>
        </div>

        {/* Submit */}
        <div className={styles.actions}>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
          <Link href={productId ? `/product/${productId}` : '/search'}>
            <Button type="button" variant="ghost">Cancel</Button>
          </Link>
        </div>
      </form>

      <aside className={styles.sidebar}>
        <div className={styles.infoBox}>
          <h3>What happens next?</h3>
          <ol>
            <li>Our research team reviews your report</li>
            <li>We investigate and gather additional evidence</li>
            <li>Product information is updated if needed</li>
            <li>You&apos;ll be notified if you provided an email</li>
          </ol>
        </div>

        <div className={styles.infoBox}>
          <h3>Need immediate help?</h3>
          <p>
            For urgent issues or direct questions, contact us at{' '}
            <a href="mailto:corrections@pfas-free-kitchen.com">
              corrections@pfas-free-kitchen.com
            </a>
          </p>
        </div>
      </aside>
    </div>
  );
}
