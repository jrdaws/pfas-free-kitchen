import type { Metadata } from 'next';
import Link from 'next/link';
import { GroupedFAQ, type FAQItem } from '@/components/content';
import { Button } from '@/components/ui';
import { FAQSchema } from '@/components/seo';
import styles from './faq.module.css';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - PFAS-Free Kitchen',
  description: 'Find answers to common questions about PFAS, our verification process, and shopping for PFAS-free cookware.',
  keywords: ['FAQ', 'PFAS questions', 'cookware FAQ', 'verification questions'],
};

// FAQ Data
const generalQuestions: FAQItem[] = [
  {
    id: 'what-is-pfas',
    question: 'What are PFAS?',
    answer: (
      <>
        <p>
          PFAS (per- and polyfluoroalkyl substances) are a group of over 15,000 
          man-made chemicals that have been used since the 1940s in various products. 
          They&apos;re often called &quot;forever chemicals&quot; because they don&apos;t break down 
          naturally in the environment.
        </p>
        <p>
          <Link href="/learn/what-is-pfas">Learn more about PFAS →</Link>
        </p>
      </>
    ),
  },
  {
    id: 'why-care',
    question: 'Why should I care about PFAS in cookware?',
    answer: (
      <>
        <p>
          Research has linked PFAS exposure to various health concerns, including 
          increased cholesterol, liver changes, thyroid disruption, and certain 
          cancers. While the research is ongoing, many consumers prefer to avoid 
          these chemicals when possible.
        </p>
        <p>
          Cookware is one of the most direct routes of exposure since PFAS-containing 
          coatings come into direct contact with your food.
        </p>
      </>
    ),
  },
  {
    id: 'teflon-pfas',
    question: 'Is Teflon the same as PFAS?',
    answer: (
      <>
        <p>
          Teflon is a brand name for PTFE (polytetrafluoroethylene), which is one 
          type of PFAS. So yes, traditional Teflon-coated cookware contains PFAS.
        </p>
        <p>
          Note that &quot;PTFE-free&quot; cookware may still contain other PFAS compounds 
          used in the manufacturing process. Look for &quot;PFAS-free&quot; instead.
        </p>
      </>
    ),
  },
];

const ratingsQuestions: FAQItem[] = [
  {
    id: 'how-verify',
    question: 'How do you verify products?',
    answer: (
      <>
        <p>
          We use a multi-step process that includes reviewing manufacturer 
          documentation, lab reports, material specifications, and public 
          statements. Based on the evidence available, we assign a verification 
          tier from 1 (lowest confidence) to 4 (highest confidence).
        </p>
        <p>
          <Link href="/learn/how-we-verify">See our full verification process →</Link>
        </p>
      </>
    ),
  },
  {
    id: 'tier-meaning',
    question: 'What does each verification tier mean?',
    answer: (
      <>
        <p><strong>Tier 4 (Monitored):</strong> Lab tested with ongoing monitoring and regular re-verification.</p>
        <p><strong>Tier 3 (Lab Tested):</strong> Independent lab testing confirms PFAS-free status.</p>
        <p><strong>Tier 2 (Policy Reviewed):</strong> Manufacturer documentation reviewed, but no independent testing.</p>
        <p><strong>Tier 1 (Brand Statement):</strong> Brand claims PFAS-free, but we haven&apos;t independently verified.</p>
      </>
    ),
  },
  {
    id: 'pay-listed',
    question: 'Can brands pay to be listed or get higher ratings?',
    answer: (
      <p>
        <strong>No.</strong> Our verification process is completely independent from 
        any affiliate relationships or brand payments. Products are listed based on 
        their PFAS-free claims, and tiers are assigned solely based on evidence quality. 
        We do not accept payment for reviews or favorable ratings.
      </p>
    ),
  },
  {
    id: 'retest-frequency',
    question: 'How often do you retest products?',
    answer: (
      <p>
        Tier 4 products are monitored on an ongoing basis (typically annually). 
        For other tiers, we update our verification when we become aware of 
        material changes, reformulations, or new evidence. Users can also report 
        concerns about specific products, which we investigate.
      </p>
    ),
  },
];

const shoppingQuestions: FAQItem[] = [
  {
    id: 'sell-directly',
    question: 'Do you sell products directly?',
    answer: (
      <p>
        No, we do not sell products. We provide research and verification information. 
        When you&apos;re ready to buy, we link to retailers (like Amazon) where you can 
        purchase the products. We may earn a commission from these links, which helps 
        fund our research.
      </p>
    ),
  },
  {
    id: 'affiliate-links',
    question: 'How do affiliate links work?',
    answer: (
      <>
        <p>
          When you click a link to a retailer on our site and make a purchase, we 
          may earn a small commission at no additional cost to you. This is how we 
          fund our research and keep the site free.
        </p>
        <p>
          Affiliate relationships never influence our verification ratings or which 
          products we include.
        </p>
        <p>
          <Link href="/disclosure">Read our full affiliate disclosure →</Link>
        </p>
      </>
    ),
  },
  {
    id: 'no-prices',
    question: 'Why don\'t you show prices?',
    answer: (
      <p>
        Prices change frequently and vary by retailer and location. Rather than 
        show potentially outdated information, we encourage you to check current 
        prices on the retailer&apos;s website. Our focus is on verification status, 
        not price comparison.
      </p>
    ),
  },
];

const productQuestions: FAQItem[] = [
  {
    id: 'ceramic-safe',
    question: 'Is ceramic coating safe?',
    answer: (
      <>
        <p>
          There are two types of &quot;ceramic&quot; cookware:
        </p>
        <ul>
          <li><strong>True ceramic (100% ceramic):</strong> Made entirely from clay and minerals. Always PFAS-free.</li>
          <li><strong>Ceramic-coated:</strong> Metal pan with a ceramic-like coating. Usually PFAS-free, but verify with the manufacturer.</li>
        </ul>
        <p>
          <Link href="/learn/buyers-guide#ceramic">Learn more about ceramic coatings →</Link>
        </p>
      </>
    ),
  },
  {
    id: 'pfoa-free',
    question: 'What about "PFOA-free" products?',
    answer: (
      <>
        <p>
          <strong>Important:</strong> &quot;PFOA-free&quot; does NOT mean &quot;PFAS-free.&quot; PFOA is 
          just one of over 15,000 PFAS chemicals. Many products labeled &quot;PFOA-free&quot; 
          still contain other PFAS compounds like GenX.
        </p>
        <p>
          Always look for products that specifically say &quot;PFAS-free&quot; or &quot;free of 
          all fluorinated compounds.&quot;
        </p>
      </>
    ),
  },
  {
    id: 'stainless-safe',
    question: 'Are all stainless steel pans PFAS-free?',
    answer: (
      <p>
        Pure stainless steel is inherently PFAS-free. However, some stainless steel 
        cookware may have non-stick coatings or treatments on certain surfaces. 
        Also check handles, lids, and other components. We verify all food-contact 
        surfaces, not just the main cooking surface.
      </p>
    ),
  },
  {
    id: 'cast-iron-safe',
    question: 'Is cast iron PFAS-free?',
    answer: (
      <p>
        Traditional cast iron seasoned with oil is naturally PFAS-free. The iron 
        itself contains no fluorinated compounds, and seasoning with vegetable oil 
        creates a natural non-stick surface. Some pre-seasoned cast iron uses 
        vegetable oil seasoning, which is also PFAS-free.
      </p>
    ),
  },
];

const faqGroups = [
  { title: 'General Questions', items: generalQuestions },
  { title: 'About Our Ratings', items: ratingsQuestions },
  { title: 'Shopping Questions', items: shoppingQuestions },
  { title: 'Product Questions', items: productQuestions },
];

// Extract FAQ data for schema (text-only versions for JSON-LD)
const allFaqs = [
  ...generalQuestions,
  ...ratingsQuestions,
  ...shoppingQuestions,
  ...productQuestions,
].map(item => ({
  question: item.question,
  answer: typeof item.answer === 'string' 
    ? item.answer 
    : item.question.includes('tier') 
      ? 'Tier 4 is highest (monitored with lab testing), Tier 3 has lab testing, Tier 2 has policy review, Tier 1 is brand statement only.'
      : 'See our website for the full answer to this question.',
}));

export default function FAQPage() {
  return (
    <div className={styles.page}>
      {/* FAQ Schema for SEO */}
      <FAQSchema faqs={allFaqs} />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>Frequently Asked Questions</h1>
        <p className={styles.subtitle}>
          Find answers to common questions about PFAS and our verification process
        </p>
      </header>

      {/* FAQ Content */}
      <section className={styles.faqContent}>
        <GroupedFAQ groups={faqGroups} allowMultiple={true} />
      </section>

      {/* Still Have Questions */}
      <section className={styles.cta}>
        <h2>Still have questions?</h2>
        <p>
          We&apos;re here to help. Check out our educational resources or get in touch.
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/learn">
            <Button>Explore Learn Section</Button>
          </Link>
          <Link href="/about#contact">
            <Button variant="outline">Contact Us</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
