import { Article } from '../models';

function source(
  id: number,
  domain: string,
  outletName: string,
  bias: string,
  biasLabel: string
): Article {
  return {
    id,
    url: `https://${domain}/`,
    domain,
    title: outletName,
    excerpt: null,
    imageUrl: null,
    publishedAt: null,
    outletName,
    bias,
    biasLabel,
    fetchStatus: 'OK',
    fetchError: null
  };
}

/**
 * Catalog outlets used to fill the bias chart while a story only has a couple
 * of real sources. Negative ids keep them off the article track.
 */
export const BIAS_MOCK_ARTICLES: Article[] = [
  source(-1, 'msnbc.com', 'MSNBC', 'LEFT', 'Left'),
  source(-2, 'vox.com', 'Vox', 'LEFT', 'Left'),
  source(-3, 'cnn.com', 'CNN', 'LEAN_LEFT', 'Lean Left'),
  source(-4, 'nytimes.com', 'New York Times', 'LEAN_LEFT', 'Lean Left'),
  source(-5, 'washingtonpost.com', 'Washington Post', 'LEAN_LEFT', 'Lean Left'),
  source(-6, 'theguardian.com', 'The Guardian', 'LEAN_LEFT', 'Lean Left'),
  source(-7, 'politico.com', 'Politico', 'LEAN_LEFT', 'Lean Left'),
  source(-8, 'reuters.com', 'Reuters', 'CENTER', 'Center'),
  source(-9, 'apnews.com', 'Associated Press', 'CENTER', 'Center'),
  source(-10, 'nbcnews.com', 'NBC News', 'CENTER', 'Center'),
  source(-11, 'cbsnews.com', 'CBS News', 'CENTER', 'Center'),
  source(-12, 'usatoday.com', 'USA Today', 'CENTER', 'Center'),
  source(-13, 'wsj.com', 'Wall Street Journal', 'LEAN_RIGHT', 'Lean Right'),
  source(-14, 'washingtonexaminer.com', 'Washington Examiner', 'LEAN_RIGHT', 'Lean Right'),
  source(-15, 'realclearpolitics.com', 'Real Clear Politics', 'LEAN_RIGHT', 'Lean Right'),
  source(-16, 'nypost.com', 'New York Post', 'RIGHT', 'Right'),
  source(-17, 'dailywire.com', 'The Daily Wire', 'RIGHT', 'Right'),
  source(-18, 'redstate.com', 'RedState', 'RIGHT', 'Right')
];
