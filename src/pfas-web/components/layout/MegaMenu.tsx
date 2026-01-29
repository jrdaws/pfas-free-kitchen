'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './MegaMenu.module.css';

interface SubCategory {
  name: string;
  href: string;
}

interface CategoryGroup {
  title: string;
  items: SubCategory[];
}

interface FeaturedProduct {
  name: string;
  href: string;
  image?: string;
  tier?: number;
}

interface Category {
  name: string;
  href: string;
  icon?: React.ReactNode;
  groups: CategoryGroup[];
  featured?: FeaturedProduct[];
  cta?: {
    label: string;
    href: string;
  };
}

const CATEGORIES: Category[] = [
  {
    name: 'Cookware',
    href: '/cookware',
    groups: [
      {
        title: 'By Type',
        items: [
          { name: 'Skillets & Frying Pans', href: '/cookware/skillets' },
          { name: 'Saucepans', href: '/cookware/saucepans' },
          { name: 'Dutch Ovens', href: '/cookware/dutch-ovens' },
          { name: 'Stock Pots', href: '/cookware/stock-pots' },
          { name: 'Woks', href: '/cookware/woks' },
          { name: 'Grill Pans', href: '/cookware/grill-pans' },
        ],
      },
      {
        title: 'By Material',
        items: [
          { name: 'Stainless Steel', href: '/cookware?material=stainless-steel' },
          { name: 'Cast Iron', href: '/cookware?material=cast-iron' },
          { name: 'Carbon Steel', href: '/cookware?material=carbon-steel' },
          { name: 'Ceramic Coated', href: '/cookware?material=ceramic' },
          { name: 'Enameled', href: '/cookware?material=enameled' },
        ],
      },
    ],
    cta: { label: 'Shop All Cookware', href: '/cookware' },
  },
  {
    name: 'Bakeware',
    href: '/bakeware',
    groups: [
      {
        title: 'By Type',
        items: [
          { name: 'Baking Sheets', href: '/bakeware/sheets' },
          { name: 'Cake Pans', href: '/bakeware/cake-pans' },
          { name: 'Muffin Tins', href: '/bakeware/muffin-tins' },
          { name: 'Loaf Pans', href: '/bakeware/loaf-pans' },
          { name: 'Pie Dishes', href: '/bakeware/pie-dishes' },
        ],
      },
      {
        title: 'By Material',
        items: [
          { name: 'Stainless Steel', href: '/bakeware?material=stainless-steel' },
          { name: 'Glass', href: '/bakeware?material=glass' },
          { name: 'Ceramic', href: '/bakeware?material=ceramic' },
          { name: 'Silicone', href: '/bakeware?material=silicone' },
        ],
      },
    ],
    cta: { label: 'Shop All Bakeware', href: '/bakeware' },
  },
  {
    name: 'Storage',
    href: '/storage',
    groups: [
      {
        title: 'By Type',
        items: [
          { name: 'Food Containers', href: '/storage/containers' },
          { name: 'Water Bottles', href: '/storage/water-bottles' },
          { name: 'Lunch Boxes', href: '/storage/lunch-boxes' },
          { name: 'Produce Storage', href: '/storage/produce' },
        ],
      },
      {
        title: 'By Material',
        items: [
          { name: 'Glass', href: '/storage?material=glass' },
          { name: 'Stainless Steel', href: '/storage?material=stainless-steel' },
          { name: 'Silicone', href: '/storage?material=silicone' },
        ],
      },
    ],
    cta: { label: 'Shop All Storage', href: '/storage' },
  },
  {
    name: 'Utensils',
    href: '/utensils',
    groups: [
      {
        title: 'By Type',
        items: [
          { name: 'Spatulas', href: '/utensils/spatulas' },
          { name: 'Spoons & Ladles', href: '/utensils/spoons' },
          { name: 'Tongs', href: '/utensils/tongs' },
          { name: 'Whisks', href: '/utensils/whisks' },
        ],
      },
      {
        title: 'By Material',
        items: [
          { name: 'Stainless Steel', href: '/utensils?material=stainless-steel' },
          { name: 'Silicone', href: '/utensils?material=silicone' },
          { name: 'Wood', href: '/utensils?material=wood' },
        ],
      },
    ],
    cta: { label: 'Shop All Utensils', href: '/utensils' },
  },
  {
    name: 'Appliances',
    href: '/appliances',
    groups: [
      {
        title: 'Small Appliances',
        items: [
          { name: 'Blenders', href: '/appliances/blenders' },
          { name: 'Coffee Makers', href: '/appliances/coffee-makers' },
          { name: 'Toasters', href: '/appliances/toasters' },
          { name: 'Air Fryers', href: '/appliances/air-fryers' },
        ],
      },
    ],
    cta: { label: 'Shop All Appliances', href: '/appliances' },
  },
];

const SPECIAL_LINKS = [
  { name: 'New Arrivals', href: '/new-arrivals', highlight: true },
  { name: 'Highest Verified', href: '/highest-verified', highlight: true },
];

const LEARN_LINKS = [
  { name: 'What is PFAS?', href: '/learn/what-is-pfas' },
  { name: 'How We Verify', href: '/learn/how-we-verify' },
  { name: 'Buyer\'s Guide', href: '/learn/buyers-guide' },
  { name: 'FAQ', href: '/faq' },
];

export function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (categoryName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveCategory(categoryName);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 150);
  };

  // Close on outside click (mobile)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMobileOpen(false);
        setActiveCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCategory(null);
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const activeData = CATEGORIES.find(c => c.name === activeCategory);

  return (
    <nav className={styles.nav} ref={menuRef}>
      {/* Mobile toggle */}
      <button
        className={styles.mobileToggle}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-expanded={isMobileOpen}
        aria-label="Toggle menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isMobileOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
        <span>Menu</span>
      </button>

      {/* Category links */}
      <ul className={`${styles.categoryList} ${isMobileOpen ? styles.mobileOpen : ''}`}>
        {CATEGORIES.map((category) => (
          <li
            key={category.name}
            className={`${styles.categoryItem} ${activeCategory === category.name ? styles.active : ''}`}
            onMouseEnter={() => handleMouseEnter(category.name)}
            onMouseLeave={handleMouseLeave}
          >
            <Link 
              href={category.href}
              className={styles.categoryLink}
              onClick={() => setIsMobileOpen(false)}
            >
              {category.name}
              <svg className={styles.chevron} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </Link>
          </li>
        ))}
        
        {/* Special links */}
        {SPECIAL_LINKS.map((link) => (
          <li key={link.name} className={styles.categoryItem}>
            <Link 
              href={link.href}
              className={`${styles.categoryLink} ${link.highlight ? styles.highlighted : ''}`}
              onClick={() => setIsMobileOpen(false)}
            >
              {link.name}
            </Link>
          </li>
        ))}

        {/* Learn dropdown */}
        <li
          className={`${styles.categoryItem} ${activeCategory === 'Learn' ? styles.active : ''}`}
          onMouseEnter={() => handleMouseEnter('Learn')}
          onMouseLeave={handleMouseLeave}
        >
          <button className={styles.categoryLink}>
            Learn
            <svg className={styles.chevron} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </li>
      </ul>

      {/* Learn dropdown menu */}
      {activeCategory === 'Learn' && (
        <div 
          className={styles.megaMenu}
          onMouseEnter={() => handleMouseEnter('Learn')}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.megaMenuInner}>
            <div className={styles.groups}>
              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Education</h3>
                <ul className={styles.groupList}>
                  {LEARN_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href} 
                        className={styles.groupLink}
                        onClick={() => setActiveCategory(null)}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.group}>
                <h3 className={styles.groupTitle}>About</h3>
                <ul className={styles.groupList}>
                  <li>
                    <Link href="/about" className={styles.groupLink} onClick={() => setActiveCategory(null)}>
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/disclosure" className={styles.groupLink} onClick={() => setActiveCategory(null)}>
                      Affiliate Disclosure
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className={styles.featured}>
              <div className={styles.ctaSection}>
                <div className={styles.ctaContent}>
                  <h3 className={styles.ctaTitle}>New to PFAS-free?</h3>
                  <p className={styles.ctaText}>
                    Start with our beginner&apos;s guide to understanding PFAS and making safer choices.
                  </p>
                </div>
                <Link 
                  href="/learn/what-is-pfas"
                  className={styles.ctaButton}
                  onClick={() => setActiveCategory(null)}
                >
                  Get Started
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mega menu dropdown */}
      {activeData && (
        <div 
          className={styles.megaMenu}
          onMouseEnter={() => handleMouseEnter(activeData.name)}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.megaMenuInner}>
            {/* Category groups */}
            <div className={styles.groups}>
              {activeData.groups.map((group) => (
                <div key={group.title} className={styles.group}>
                  <h3 className={styles.groupTitle}>{group.title}</h3>
                  <ul className={styles.groupList}>
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link 
                          href={item.href} 
                          className={styles.groupLink}
                          onClick={() => setActiveCategory(null)}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Featured products or CTA */}
            <div className={styles.featured}>
              {activeData.featured && activeData.featured.length > 0 ? (
                <div className={styles.featuredProducts}>
                  <h3 className={styles.featuredTitle}>Featured</h3>
                  {activeData.featured.map((product) => (
                    <Link 
                      key={product.href}
                      href={product.href}
                      className={styles.featuredProduct}
                      onClick={() => setActiveCategory(null)}
                    >
                      <div className={styles.featuredImage}>
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <div className={styles.featuredPlaceholder}>
                            <span>🍳</span>
                          </div>
                        )}
                      </div>
                      <span className={styles.featuredName}>{product.name}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className={styles.ctaSection}>
                  <div className={styles.ctaContent}>
                    <h3 className={styles.ctaTitle}>Explore {activeData.name}</h3>
                    <p className={styles.ctaText}>
                      Browse our selection of verified PFAS-free {activeData.name.toLowerCase()}.
                    </p>
                  </div>
                  {activeData.cta && (
                    <Link 
                      href={activeData.cta.href}
                      className={styles.ctaButton}
                      onClick={() => setActiveCategory(null)}
                    >
                      {activeData.cta.label}
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default MegaMenu;
