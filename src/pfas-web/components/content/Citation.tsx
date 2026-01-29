import { SOURCES, getSourceUrl, type Source } from '@/data/sources';
import styles from './Citation.module.css';

interface CitationProps {
  source: keyof typeof SOURCES;
  inline?: boolean;
}

export function Citation({ source, inline = false }: CitationProps) {
  const sourceData = SOURCES[source];

  if (!sourceData) {
    console.warn(`Citation: Unknown source "${source}"`);
    return null;
  }

  const url = getSourceUrl(sourceData);

  if (inline) {
    return (
      <sup className={styles.inline}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.inlineLink}
          title={sourceData.name}
        >
          [{getShortName(sourceData)}]
        </a>
      </sup>
    );
  }

  return (
    <div className={styles.full}>
      {sourceData.type === 'peer_reviewed' ? (
        <p className={styles.citation}>
          {sourceData.name}. &ldquo;{sourceData.title}.&rdquo;{' '}
          <em>{sourceData.journal}</em>, {sourceData.year}.{' '}
          <span className={styles.doi}>
            DOI:{' '}
            <a href={url} target="_blank" rel="noopener noreferrer">
              {sourceData.doi}
            </a>
          </span>
        </p>
      ) : (
        <p className={styles.citation}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {sourceData.name}
          </a>
          . Accessed {sourceData.accessed}.
        </p>
      )}
    </div>
  );
}

function getShortName(source: Source): string {
  if (source.type === 'peer_reviewed') {
    // Extract first author's last name and year
    const match = source.name.match(/^(\w+)/);
    return match ? `${match[1]} ${source.year}` : source.name;
  }
  // For government/org sources, use acronym if possible
  const acronyms: Record<string, string> = {
    'EPA PFAS Homepage': 'EPA',
    'CDC ATSDR PFAS Fact Sheet': 'CDC',
    'FDA PFAS Information': 'FDA',
    'EPA PFAS Health Effects': 'EPA',
    'NIEHS Perfluoroalkyl and Polyfluoroalkyl Substances': 'NIEHS',
    'Environmental Working Group': 'EWG',
    'Green Science Policy Institute': 'GSPI',
  };
  return acronyms[source.name] || source.name;
}

// Bibliography component for listing all cited sources
interface SourcesBibliographyProps {
  sources: Array<keyof typeof SOURCES>;
  title?: string;
}

export function SourcesBibliography({
  sources,
  title = 'Sources & Further Reading',
}: SourcesBibliographyProps) {
  const governmentSources = sources.filter((key) => {
    const s = SOURCES[key];
    return s && s.type === 'government';
  });

  const peerReviewedSources = sources.filter((key) => {
    const s = SOURCES[key];
    return s && s.type === 'peer_reviewed';
  });

  const organizationSources = sources.filter((key) => {
    const s = SOURCES[key];
    return s && s.type === 'organization';
  });

  return (
    <section className={styles.bibliography}>
      <h2 id="sources" className={styles.bibliographyTitle}>
        {title}
      </h2>

      {governmentSources.length > 0 && (
        <div className={styles.sourceGroup}>
          <h3 className={styles.groupTitle}>Government Sources</h3>
          <ul className={styles.sourceList}>
            {governmentSources.map((key) => (
              <li key={key}>
                <Citation source={key} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {peerReviewedSources.length > 0 && (
        <div className={styles.sourceGroup}>
          <h3 className={styles.groupTitle}>Scientific Literature</h3>
          <ul className={styles.sourceList}>
            {peerReviewedSources.map((key) => (
              <li key={key}>
                <Citation source={key} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {organizationSources.length > 0 && (
        <div className={styles.sourceGroup}>
          <h3 className={styles.groupTitle}>Consumer Resources</h3>
          <ul className={styles.sourceList}>
            {organizationSources.map((key) => (
              <li key={key}>
                <Citation source={key} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default Citation;
