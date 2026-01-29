/**
 * Authoritative sources for educational content
 * All health claims must cite from this list
 */

export interface GovernmentSource {
  name: string;
  url: string;
  type: 'government';
  accessed: string;
}

export interface PeerReviewedSource {
  name: string;
  title: string;
  journal: string;
  year: number;
  doi: string;
  type: 'peer_reviewed';
}

export interface OrganizationSource {
  name: string;
  url: string;
  type: 'organization';
  accessed: string;
}

export type Source = GovernmentSource | PeerReviewedSource | OrganizationSource;

export const SOURCES: Record<string, Source> = {
  // Government Sources
  epa_pfas: {
    name: 'EPA PFAS Homepage',
    url: 'https://www.epa.gov/pfas',
    type: 'government',
    accessed: '2026-01-28',
  },
  cdc_atsdr: {
    name: 'CDC ATSDR PFAS Fact Sheet',
    url: 'https://www.atsdr.cdc.gov/pfas/',
    type: 'government',
    accessed: '2026-01-28',
  },
  fda_pfas: {
    name: 'FDA PFAS Information',
    url: 'https://www.fda.gov/food/process-contaminants-food/and-polyfluoroalkyl-substances-pfas',
    type: 'government',
    accessed: '2026-01-28',
  },
  epa_health_effects: {
    name: 'EPA PFAS Health Effects',
    url: 'https://www.epa.gov/pfas/our-current-understanding-human-health-and-environmental-risks-pfas',
    type: 'government',
    accessed: '2026-01-28',
  },
  niehs_pfas: {
    name: 'NIEHS Perfluoroalkyl and Polyfluoroalkyl Substances',
    url: 'https://www.niehs.nih.gov/health/topics/agents/pfc',
    type: 'government',
    accessed: '2026-01-28',
  },

  // Peer-Reviewed Literature
  sunderland_2019: {
    name: 'Sunderland et al. 2019',
    title: 'A review of the pathways of human exposure to poly- and perfluoroalkyl substances (PFASs) and present understanding of health effects',
    journal: 'Journal of Exposure Science & Environmental Epidemiology',
    year: 2019,
    doi: '10.1038/s41370-018-0094-1',
    type: 'peer_reviewed',
  },
  cousins_2020: {
    name: 'Cousins et al. 2020',
    title: 'The high persistence of PFAS is sufficient for their management as a chemical class',
    journal: 'Environmental Science: Processes & Impacts',
    year: 2020,
    doi: '10.1039/D0EM00240B',
    type: 'peer_reviewed',
  },
  fenton_2021: {
    name: 'Fenton et al. 2021',
    title: 'Per- and Polyfluoroalkyl Substance Toxicity and Human Health Review: Current State of Knowledge and Strategies for Informing Future Research',
    journal: 'Environmental Toxicology and Chemistry',
    year: 2021,
    doi: '10.1002/etc.4890',
    type: 'peer_reviewed',
  },
  bartell_2020: {
    name: 'Bartell & Vieira 2020',
    title: 'Critical review on PFOA, kidney cancer, and testicular cancer',
    journal: 'Journal of the Air & Waste Management Association',
    year: 2020,
    doi: '10.1080/10962247.2020.1768833',
    type: 'peer_reviewed',
  },
  grandjean_2022: {
    name: 'Grandjean et al. 2022',
    title: 'Immunotoxicity of perfluorinated alkylates: calculation of benchmark doses based on serum concentrations in children',
    journal: 'Environmental Health',
    year: 2022,
    doi: '10.1186/s12940-022-00867-7',
    type: 'peer_reviewed',
  },

  // Organizations
  ewg: {
    name: 'Environmental Working Group',
    url: 'https://www.ewg.org/areas-focus/toxic-chemicals/pfas-chemicals',
    type: 'organization',
    accessed: '2026-01-28',
  },
  gspi: {
    name: 'Green Science Policy Institute',
    url: 'https://greensciencepolicy.org/pfas/',
    type: 'organization',
    accessed: '2026-01-28',
  },
};

// Helper to get a source by key
export function getSource(key: string): Source | undefined {
  return SOURCES[key];
}

// Format citation for display
export function formatCitation(source: Source): string {
  if (source.type === 'peer_reviewed') {
    return `${source.name}. "${source.title}." ${source.journal}, ${source.year}. DOI: ${source.doi}`;
  }
  return `${source.name}. Accessed ${source.accessed}.`;
}

// Get URL for a source
export function getSourceUrl(source: Source): string {
  if (source.type === 'peer_reviewed') {
    return `https://doi.org/${source.doi}`;
  }
  return source.url;
}
