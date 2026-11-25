export type BiasSide = 'LEFT' | 'CENTER' | 'RIGHT';

export interface BiasDistribution {
  left: number;
  center: number;
  right: number;
  untracked: number;
  trackedTotal: number;
  leftPct: number;
  centerPct: number;
  rightPct: number;
}

export interface Article {
  id: number;
  url: string;
  domain: string;
  title: string | null;
  excerpt: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  outletName: string;
  bias: string;
  biasLabel: string;
  fetchStatus: 'OK' | 'FAILED';
  fetchError: string | null;
}

export interface Story {
  id: number;
  title: string;
  summary: string | null;
  origin: string;
  createdAt: string;
  distribution: BiasDistribution;
  articles: Article[];
}

export interface StorySummary {
  id: number;
  title: string;
  createdAt: string;
  articleCount: number;
  distribution: BiasDistribution;
  imageUrl: string | null;
}

export interface CreateStoryRequest {
  title?: string;
  urls: string[];
}
