import { Article } from './models';

/** Five-point outlet lean. Index 2 is Center. UNTRACKED is not on the axis. */
export const BIAS_AXIS = [
  { id: 'LEFT', label: 'Left' },
  { id: 'LEAN_LEFT', label: 'Lean left' },
  { id: 'CENTER', label: 'Center' },
  { id: 'LEAN_RIGHT', label: 'Lean right' },
  { id: 'RIGHT', label: 'Right' }
] as const;

const CENTER_INDEX = 2;

export function biasIndex(bias: string): number {
  return BIAS_AXIS.findIndex((point) => point.id === bias);
}

export function biasSide(bias: string): 'LEFT' | 'CENTER' | 'RIGHT' | null {
  if (bias === 'LEFT' || bias === 'LEAN_LEFT') {
    return 'LEFT';
  }
  if (bias === 'CENTER') {
    return 'CENTER';
  }
  if (bias === 'RIGHT' || bias === 'LEAN_RIGHT') {
    return 'RIGHT';
  }
  return null;
}

/** First sentence, matching the extractive summarizer's cap. */
export function leadSentence(excerpt: string): string {
  const text = excerpt.trim();
  let end = -1;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if ((c === '.' || c === '!' || c === '?') && i >= 40) {
      end = i + 1;
      break;
    }
  }
  let sentence = end > 0 ? text.slice(0, end) : text;
  if (sentence.length > 240) {
    sentence = sentence.slice(0, 240).trim() + '…';
  }
  return sentence;
}

function distanceFromCenter(bias: string): number {
  const index = biasIndex(bias);
  if (index < 0) {
    return 99;
  }
  return Math.abs(index - CENTER_INDEX);
}

/** Center, then outward. Same-distance ties keep the left-er source first. */
export function centerFirst(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => {
    const distance = distanceFromCenter(a.bias) - distanceFromCenter(b.bias);
    if (distance !== 0) {
      return distance;
    }
    return biasIndex(a.bias) - biasIndex(b.bias);
  });
}

/** Left to right. Untracked sources sit at the end, in original order. */
export function spectrumOrder(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => {
    const ia = biasIndex(a.bias);
    const ib = biasIndex(b.bias);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
}

export function defaultArticle(articles: Article[]): Article | undefined {
  const ordered = spectrumOrder(articles);
  return ordered.find((article) => biasSide(article.bias) === 'CENTER')
    ?? [...ordered].sort((a, b) => distanceFromCenter(a.bias) - distanceFromCenter(b.bias))[0];
}

export function factCheckUrl(title: string | null, url: string): string {
  const query = (title && title.trim()) || url;
  return `https://toolbox.google.com/factcheck/explorer/search/${encodeURIComponent(query)};hl=en`;
}
