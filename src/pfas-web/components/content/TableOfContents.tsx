'use client';

import { useState, useEffect } from 'react';
import styles from './TableOfContents.module.css';

export interface TOCHeading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TOCHeading[];
  title?: string;
}

export function TableOfContents({ headings, title = 'On this page' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
        threshold: 0,
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
      // Update URL without scrolling
      history.pushState(null, '', `#${id}`);
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className={styles.toc} aria-label="Table of contents">
      <p className={styles.title}>{title}</p>
      <ul className={styles.list}>
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`${styles.item} ${activeId === heading.id ? styles.active : ''}`}
            style={{ paddingLeft: `${(heading.level - 2) * 16}px` }}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={styles.link}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Helper to generate TOC from page content
export function generateTOC(selector: string = 'h2, h3'): TOCHeading[] {
  if (typeof document === 'undefined') return [];

  const headings = document.querySelectorAll(selector);
  return Array.from(headings).map((heading) => ({
    id: heading.id,
    text: heading.textContent || '',
    level: parseInt(heading.tagName.charAt(1)),
  }));
}

export default TableOfContents;
