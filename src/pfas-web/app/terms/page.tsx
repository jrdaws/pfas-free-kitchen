import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoBox, TableOfContents } from '@/components/content';
import styles from './terms.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service - PFAS-Free Kitchen',
  description: 'Terms and conditions governing the use of PFAS-Free Kitchen website and services.',
  keywords: ['terms of service', 'terms and conditions', 'legal', 'user agreement'],
};

const TOC_HEADINGS = [
  { id: 'acceptance', text: 'Acceptance of Terms', level: 2 },
  { id: 'use', text: 'Use of the Site', level: 2 },
  { id: 'content', text: 'Content & Information', level: 2 },
  { id: 'disclaimers', text: 'Disclaimers', level: 2 },
  { id: 'intellectual-property', text: 'Intellectual Property', level: 2 },
  { id: 'user-submissions', text: 'User Submissions', level: 2 },
  { id: 'affiliate-links', text: 'Affiliate Links', level: 2 },
  { id: 'limitation', text: 'Limitation of Liability', level: 2 },
  { id: 'indemnification', text: 'Indemnification', level: 2 },
  { id: 'governing-law', text: 'Governing Law', level: 2 },
  { id: 'changes', text: 'Changes to Terms', level: 2 },
  { id: 'contact', text: 'Contact', level: 2 },
];

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Terms of Service</span>
        </nav>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.updated}>Last Updated: January 28, 2026</p>
        <p className={styles.effectiveDate}>Effective Date: January 1, 2026</p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <TableOfContents headings={TOC_HEADINGS} title="Contents" />
        </aside>

        <article className={styles.content}>
          <div className={styles.intro}>
            <p>
              Welcome to PFAS-Free Kitchen. These Terms of Service (&quot;Terms&quot;) govern 
              your access to and use of the pfasfreekitchen.com website (the &quot;Site&quot;) 
              and any related services provided by PFAS-Free Kitchen (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            </p>
            <p>
              By accessing or using the Site, you agree to be bound by these Terms. If you 
              do not agree to these Terms, you may not access or use the Site.
            </p>
          </div>

          {/* Acceptance of Terms */}
          <section className={styles.section} id="acceptance">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing this Site, you acknowledge that you have read, understood, and 
              agree to be bound by these Terms and our{' '}
              <Link href="/privacy">Privacy Policy</Link>, which is incorporated herein 
              by reference.
            </p>
            <p>
              If you are using the Site on behalf of an organization, you represent and 
              warrant that you have the authority to bind that organization to these Terms.
            </p>
            <p>
              You represent that you are at least 13 years of age. If you are under 18, 
              you represent that your parent or guardian has reviewed and agreed to these Terms.
            </p>
          </section>

          {/* Use of the Site */}
          <section className={styles.section} id="use">
            <h2>2. Use of the Site</h2>
            
            <h3>Permitted Use</h3>
            <p>
              The Site is provided for your personal, non-commercial use to research 
              kitchen products and related information. You may:
            </p>
            <ul>
              <li>Browse product information and educational content</li>
              <li>Use our search and comparison features</li>
              <li>Share links to our content</li>
              <li>Submit product suggestions and feedback</li>
            </ul>

            <h3>Prohibited Use</h3>
            <p>You agree NOT to:</p>
            <ul>
              <li>Use the Site for any unlawful purpose</li>
              <li>Scrape, harvest, or collect data from the Site using automated means without permission</li>
              <li>Interfere with or disrupt the Site or servers</li>
              <li>Attempt to gain unauthorized access to any portion of the Site</li>
              <li>Use the Site to transmit viruses, malware, or harmful code</li>
              <li>Impersonate any person or entity</li>
              <li>Submit false or misleading information</li>
              <li>Use our content for commercial purposes without permission</li>
              <li>Frame or mirror any portion of the Site without permission</li>
            </ul>
          </section>

          {/* Content & Information */}
          <section className={styles.section} id="content">
            <h2>3. Content &amp; Information</h2>
            
            <h3>Information Accuracy</h3>
            <p>
              We strive to provide accurate and up-to-date information about kitchen 
              products and PFAS. However:
            </p>
            <ul>
              <li>Product information may change without notice</li>
              <li>Manufacturers may modify formulations</li>
              <li>Our research represents information available at the time of review</li>
              <li>We cannot guarantee the accuracy of third-party information</li>
            </ul>

            <h3>Verification Tiers</h3>
            <p>
              Our verification tier system indicates the quality of evidence available 
              for each product. A higher tier means stronger evidence, not necessarily 
              a &quot;better&quot; product. Tiers may change as new information becomes available.
            </p>

            <h3>Third-Party Links</h3>
            <p>
              The Site contains links to third-party websites (retailers, manufacturers, 
              etc.). We are not responsible for the content, accuracy, or practices of 
              these external sites. Links do not imply endorsement.
            </p>
          </section>

          {/* Disclaimers */}
          <section className={styles.section} id="disclaimers">
            <h2>4. Important Disclaimers</h2>
            
            <InfoBox type="warning" title="Not Medical or Health Advice">
              <p>
                <strong>The information on this Site is for general informational purposes 
                only and is not intended as medical, health, or safety advice.</strong>
              </p>
              <p>
                We do not make claims that any product is &quot;safer&quot; or &quot;healthier.&quot; We 
                only report on the presence or absence of PFAS based on available evidence.
              </p>
            </InfoBox>

            <h3>No Warranty</h3>
            <p>
              THE SITE AND ALL CONTENT ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT 
              WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. We do not warrant that:
            </p>
            <ul>
              <li>The Site will be available at all times or error-free</li>
              <li>Information on the Site is complete, accurate, or current</li>
              <li>Results obtained from using the Site will be accurate or reliable</li>
              <li>Any defects will be corrected</li>
            </ul>

            <h3>No Professional Advice</h3>
            <p>
              Nothing on the Site constitutes professional advice of any kind. You should 
              consult appropriate professionals (medical, legal, etc.) before making 
              decisions based on information found here.
            </p>

            <h3>Product Availability</h3>
            <p>
              Products listed on the Site may be discontinued, reformulated, or unavailable. 
              Prices shown are provided by third parties and may not be current. Always 
              verify information directly with retailers before purchasing.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className={styles.section} id="intellectual-property">
            <h2>5. Intellectual Property</h2>
            
            <h3>Our Content</h3>
            <p>
              All original content on the Site, including text, graphics, logos, images, 
              and software, is owned by PFAS-Free Kitchen or its licensors and is protected 
              by copyright, trademark, and other intellectual property laws.
            </p>

            <h3>Limited License</h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable license to access 
              and use the Site for personal, non-commercial purposes. This license does 
              not include:
            </p>
            <ul>
              <li>Reproducing, distributing, or displaying content beyond fair use</li>
              <li>Modifying or creating derivative works</li>
              <li>Using content for commercial purposes</li>
              <li>Removing copyright or proprietary notices</li>
            </ul>

            <h3>Trademarks</h3>
            <p>
              Product names, brand names, and company names mentioned on the Site are 
              trademarks of their respective owners. Use of these marks does not imply 
              endorsement or affiliation.
            </p>
          </section>

          {/* User Submissions */}
          <section className={styles.section} id="user-submissions">
            <h2>6. User Submissions</h2>
            <p>
              By submitting content to us (product suggestions, error reports, feedback, 
              etc.), you:
            </p>
            <ul>
              <li>
                Grant us a non-exclusive, royalty-free, perpetual license to use, modify, 
                and display the submission
              </li>
              <li>
                Represent that you have the right to submit the content
              </li>
              <li>
                Agree that submissions are non-confidential
              </li>
              <li>
                Acknowledge that we have no obligation to use any submission
              </li>
            </ul>
            <p>
              We reserve the right to remove any user submission at our sole discretion.
            </p>
          </section>

          {/* Affiliate Links */}
          <section className={styles.section} id="affiliate-links">
            <h2>7. Affiliate Links &amp; Advertising</h2>
            <p>
              The Site contains affiliate links. When you click on these links and make 
              a purchase, we may earn a commission at no additional cost to you. 
              See our{' '}
              <Link href="/disclosure">Affiliate Disclosure</Link> for complete details.
            </p>
            <p>
              By using the Site, you acknowledge and accept our use of affiliate links 
              and agree that affiliate relationships do not influence our product 
              verification process.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className={styles.section} id="limitation">
            <h2>8. Limitation of Liability</h2>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, PFAS-FREE KITCHEN AND ITS OFFICERS, 
              DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:
            </p>
            <ul>
              <li>
                Any indirect, incidental, special, consequential, or punitive damages
              </li>
              <li>
                Any loss of profits, revenue, data, or goodwill
              </li>
              <li>
                Any damages arising from your use of the Site or reliance on its content
              </li>
              <li>
                Any damages arising from third-party products or services
              </li>
            </ul>
            <p>
              IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID TO US 
              IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS LESS.
            </p>
            <p>
              Some jurisdictions do not allow the exclusion or limitation of certain 
              damages. In such jurisdictions, our liability is limited to the maximum 
              extent permitted by law.
            </p>
          </section>

          {/* Indemnification */}
          <section className={styles.section} id="indemnification">
            <h2>9. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless PFAS-Free Kitchen and 
              its officers, directors, employees, and agents from any claims, damages, 
              losses, liabilities, and expenses (including reasonable attorneys&apos; fees) 
              arising from:
            </p>
            <ul>
              <li>Your use of the Site</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another</li>
              <li>Any content you submit to the Site</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section className={styles.section} id="governing-law">
            <h2>10. Governing Law &amp; Disputes</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the 
              laws of the State of Delaware, United States, without regard to its 
              conflict of law provisions.
            </p>
            <p>
              Any dispute arising from these Terms or your use of the Site shall be 
              resolved through binding arbitration in accordance with the rules of 
              the American Arbitration Association, except that you may bring claims 
              in small claims court if eligible.
            </p>
            <p>
              <strong>Class Action Waiver:</strong> You agree to resolve disputes on 
              an individual basis and waive any right to participate in class action 
              lawsuits or class-wide arbitration.
            </p>
          </section>

          {/* Termination */}
          <section className={styles.section}>
            <h2>11. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Site at 
              any time, for any reason, without notice. Upon termination, your right 
              to use the Site will immediately cease.
            </p>
            <p>
              The following sections shall survive termination: Disclaimers, Intellectual 
              Property, Limitation of Liability, Indemnification, and Governing Law.
            </p>
          </section>

          {/* Severability */}
          <section className={styles.section}>
            <h2>12. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, 
              that provision shall be limited or eliminated to the minimum extent 
              necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          {/* Entire Agreement */}
          <section className={styles.section}>
            <h2>13. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy and Affiliate Disclosure, 
              constitute the entire agreement between you and PFAS-Free Kitchen regarding 
              your use of the Site and supersede all prior agreements and understandings.
            </p>
          </section>

          {/* Changes */}
          <section className={styles.section} id="changes">
            <h2>14. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify you of material 
              changes by:
            </p>
            <ul>
              <li>Posting the updated Terms on this page</li>
              <li>Updating the &quot;Last Updated&quot; date</li>
              <li>For significant changes, displaying a prominent notice on the Site</li>
            </ul>
            <p>
              Your continued use of the Site after changes are posted constitutes your 
              acceptance of the modified Terms.
            </p>
          </section>

          {/* Contact */}
          <section className={styles.section} id="contact">
            <h2>15. Contact Us</h2>
            <p>
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className={styles.contactBox}>
              <p><strong>Email:</strong> <a href="mailto:legal@pfasfreekitchen.com">legal@pfasfreekitchen.com</a></p>
              <p><strong>Subject Line:</strong> Terms of Service Inquiry</p>
            </div>
          </section>

          {/* Related Links */}
          <section className={styles.related}>
            <h2>Related Policies</h2>
            <div className={styles.relatedLinks}>
              <Link href="/privacy" className={styles.relatedLink}>
                Privacy Policy →
              </Link>
              <Link href="/disclosure" className={styles.relatedLink}>
                Affiliate Disclosure →
              </Link>
              <Link href="/about" className={styles.relatedLink}>
                About Us →
              </Link>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
