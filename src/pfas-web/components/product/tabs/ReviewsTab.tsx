import type { Product } from '@/lib/types';
import { Button } from '../../ui/Button';
import styles from './tabs.module.css';

interface ReviewsTabProps {
  product: Product;
  reviews?: Review[];
}

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
}

export function ReviewsTab({ product, reviews = [] }: ReviewsTabProps) {
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className={styles.tab}>
      {/* Summary */}
      <section className={styles.section}>
        <div className={styles.reviewSummary}>
          <div className={styles.ratingOverview}>
            <span className={styles.averageRating}>
              {averageRating > 0 ? averageRating.toFixed(1) : '—'}
            </span>
            <div className={styles.stars} aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={star <= Math.round(averageRating) ? styles.starFilled : styles.starEmpty}
                  aria-hidden="true"
                >
                  ★
                </span>
              ))}
            </div>
            <span className={styles.reviewCount}>
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
          <Button variant="secondary" size="sm">
            Write a Review
          </Button>
        </div>
      </section>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.reviewsList}>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.emptyState}>
          <div className={styles.emptyIcon}>💬</div>
          <h4>No reviews yet</h4>
          <p>Be the first to share your experience with this product.</p>
          <Button variant="primary" size="md">
            Write the First Review
          </Button>
        </section>
      )}

      {/* Disclaimer */}
      <section className={styles.disclaimer}>
        <p>
          Reviews are submitted by users and represent their personal experiences. 
          PFAS-Free Kitchen does not verify purchase or use of products.
        </p>
      </section>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className={styles.reviewCard}>
      <header className={styles.reviewHeader}>
        <div className={styles.reviewMeta}>
          <span className={styles.reviewAuthor}>{review.author}</span>
          {review.verified && (
            <span className={styles.verifiedBadge}>✓ Verified</span>
          )}
        </div>
        <div className={styles.reviewStars} aria-label={`${review.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span 
              key={star} 
              className={star <= review.rating ? styles.starFilled : styles.starEmpty}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
        </div>
      </header>
      
      <h5 className={styles.reviewTitle}>{review.title}</h5>
      <p className={styles.reviewContent}>{review.content}</p>
      
      <footer className={styles.reviewFooter}>
        <time className={styles.reviewDate}>
          {new Date(review.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </footer>
    </article>
  );
}
