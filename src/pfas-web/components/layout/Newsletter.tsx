'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import styles from './Newsletter.module.css';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // In production, this would call an API endpoint
      // await subscribeNewsletter(email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      success('Thanks for subscribing! Check your email for confirmation.');
      setIsSubscribed(true);
      setEmail('');
    } catch (err) {
      error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <span className={styles.checkIcon}>✓</span>
          <p>You&apos;re subscribed! Check your email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h3 className={styles.title}>Stay Updated</h3>
        <p className={styles.description}>
          Get notified about new verified products and PFAS research updates.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={styles.input}
          aria-label="Email address for newsletter"
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
      
      <p className={styles.disclaimer}>
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}

export default Newsletter;
