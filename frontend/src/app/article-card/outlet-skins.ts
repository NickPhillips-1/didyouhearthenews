/**
 * Maps a registrable domain to a visual skin for its article card. The skin id
 * becomes a CSS class (skin-<id>) on the card, which drives the masthead, fonts,
 * and accent colors. Every outlet in the backend catalog is covered; unknown
 * domains fall back to a plain untracked card that shows the domain as its name.
 *
 * These are distinct editorial treatments, not copies of proprietary logos.
 */
export type SkinId =
  | 'cnn'
  | 'fox'
  | 'nyt'
  | 'wapo'
  | 'wsj'
  | 'ap'
  | 'reuters'
  | 'guardian'
  | 'msnbc'
  | 'nbc'
  | 'cbs'
  | 'abc'
  | 'pbs'
  | 'usatoday'
  | 'thehill'
  | 'politico'
  | 'vox'
  | 'nypost'
  | 'dailywire'
  | 'examiner'
  | 'redstate'
  | 'rcp'
  | 'cspan'
  | 'dmn'
  | 'ksat'
  | 'untracked';

export interface OutletSkin {
  id: SkinId;
  /** Masthead wordmark. Null means the card shows the outlet/domain name instead. */
  wordmark: string | null;
  /** Default section kicker shown above the headline. */
  kicker: string;
}

const SKINS: Record<string, OutletSkin> = {
  'cnn.com': { id: 'cnn', wordmark: 'CNN', kicker: 'Politics' },
  'foxnews.com': { id: 'fox', wordmark: 'FOX NEWS', kicker: 'Politics' },
  'nytimes.com': { id: 'nyt', wordmark: 'The New York Times', kicker: 'U.S.' },
  'washingtonpost.com': { id: 'wapo', wordmark: 'The Washington Post', kicker: 'Politics' },
  'wsj.com': { id: 'wsj', wordmark: 'THE WALL STREET JOURNAL', kicker: 'U.S.' },
  'apnews.com': { id: 'ap', wordmark: 'AP Associated Press', kicker: 'Politics' },
  'reuters.com': { id: 'reuters', wordmark: 'REUTERS', kicker: 'World' },
  'theguardian.com': { id: 'guardian', wordmark: 'The Guardian', kicker: 'US news' },
  'msnbc.com': { id: 'msnbc', wordmark: 'MSNBC', kicker: 'Opinion' },
  'nbcnews.com': { id: 'nbc', wordmark: 'NBC NEWS', kicker: 'Politics' },
  'nbcdfw.com': { id: 'nbc', wordmark: 'NBC 5 Dallas-Fort Worth', kicker: 'Local' },
  'cbsnews.com': { id: 'cbs', wordmark: 'CBS NEWS', kicker: 'Politics' },
  'abcnews.go.com': { id: 'abc', wordmark: 'ABC NEWS', kicker: 'Politics' },
  'pbs.org': { id: 'pbs', wordmark: 'PBS NewsHour', kicker: 'Politics' },
  'usatoday.com': { id: 'usatoday', wordmark: 'USA TODAY', kicker: 'Politics' },
  'elpasotimes.com': { id: 'usatoday', wordmark: 'El Paso Times', kicker: 'News' },
  'thehill.com': { id: 'thehill', wordmark: 'THE HILL', kicker: 'Campaign' },
  'politico.com': { id: 'politico', wordmark: 'POLITICO', kicker: 'Elections' },
  'vox.com': { id: 'vox', wordmark: 'Vox', kicker: 'Policy' },
  'nypost.com': { id: 'nypost', wordmark: 'New York Post', kicker: 'US News' },
  'dailywire.com': { id: 'dailywire', wordmark: 'The Daily Wire', kicker: 'News' },
  'washingtonexaminer.com': { id: 'examiner', wordmark: 'Washington Examiner', kicker: 'Politics' },
  'redstate.com': { id: 'redstate', wordmark: 'RedState', kicker: 'Front Page' },
  'realclearpolitics.com': { id: 'rcp', wordmark: 'RealClearPolitics', kicker: 'Politics' },
  'c-span.org': { id: 'cspan', wordmark: 'C-SPAN', kicker: 'Congress' },
  'dallasnews.com': { id: 'dmn', wordmark: 'The Dallas Morning News', kicker: 'Politics' },
  'ksat.com': { id: 'ksat', wordmark: 'KSAT 12', kicker: 'News' }
};

const UNTRACKED: OutletSkin = { id: 'untracked', wordmark: null, kicker: 'News' };

/** Catalog domains that have a real outlet mark in /logos. */
const LOGO_DOMAINS = new Set<string>([...Object.keys(SKINS), 'abcnews.com']);

export function skinForDomain(domain: string): OutletSkin {
  return SKINS[domain] ?? UNTRACKED;
}

/** Public path to the outlet's logo, or null when this domain has no mark on file. */
export function logoForDomain(domain: string): string | null {
  if (!LOGO_DOMAINS.has(domain)) {
    return null;
  }
  return `logos/${domain}.png`;
}
