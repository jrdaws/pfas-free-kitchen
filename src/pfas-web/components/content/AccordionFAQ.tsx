'use client';

import { useState } from 'react';
import styles from './AccordionFAQ.module.css';

export interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
  category?: string;
}

interface AccordionFAQProps {
  items: FAQItem[];
  defaultOpenId?: string;
  allowMultiple?: boolean;
}

export function AccordionFAQ({ items, defaultOpenId, allowMultiple = false }: AccordionFAQProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    defaultOpenId ? new Set([defaultOpenId]) : new Set()
  );

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isOpen = (id: string) => openIds.has(id);

  return (
    <div className={styles.accordion}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`${styles.item} ${isOpen(item.id) ? styles.open : ''}`}
        >
          <button
            className={styles.trigger}
            onClick={() => toggleItem(item.id)}
            aria-expanded={isOpen(item.id)}
            aria-controls={`faq-content-${item.id}`}
            id={`faq-trigger-${item.id}`}
          >
            <span className={styles.question}>{item.question}</span>
            <span className={styles.icon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
          <div
            id={`faq-content-${item.id}`}
            role="region"
            aria-labelledby={`faq-trigger-${item.id}`}
            className={styles.content}
            hidden={!isOpen(item.id)}
          >
            <div className={styles.answer}>{item.answer}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Grouped FAQ component for categories
interface GroupedFAQProps {
  groups: {
    title: string;
    items: FAQItem[];
  }[];
  allowMultiple?: boolean;
}

export function GroupedFAQ({ groups, allowMultiple = false }: GroupedFAQProps) {
  return (
    <div className={styles.groupedFAQ}>
      {groups.map((group, index) => (
        <section key={index} className={styles.group}>
          <h3 className={styles.groupTitle}>{group.title}</h3>
          <AccordionFAQ items={group.items} allowMultiple={allowMultiple} />
        </section>
      ))}
    </div>
  );
}

export default AccordionFAQ;
