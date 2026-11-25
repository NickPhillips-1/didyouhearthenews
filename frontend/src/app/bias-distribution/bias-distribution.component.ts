import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { logoForDomain, skinForDomain } from '../article-card/outlet-skins';
import { BIAS_AXIS, biasSide } from '../bias-axis';
import { Article, BiasDistribution } from '../models';
import { BIAS_MOCK_ARTICLES } from './mock-articles';

/** Fills empty bias columns with catalog outlets so the chart can be reviewed. */
const SHOW_MOCK_SOURCES = true;

interface Column {
  id: string;
  shown: Article[];
  extra: number;
}

const VISIBLE = 4;

/** Spectrum of outlets for one story: L/C/R bar plus a column of marks per lean. */
@Component({
  selector: 'app-bias-distribution',
  standalone: true,
  templateUrl: './bias-distribution.component.html',
  styleUrl: './bias-distribution.component.css'
})
export class BiasDistributionComponent implements OnChanges {
  private readonly hiddenLogos = new Set<string>();
  private previewId: number | null = null;

  @Input({ required: true }) articles: Article[] = [];
  @Input() distribution: BiasDistribution | null = null;
  @Input() selectedId: number | null = null;
  /** Story page selects a source. The landing page link wraps the chart, so marks stay non-buttons. */
  @Input() interactive = true;
  @Output() selectArticle = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedId'] && !changes['selectedId'].firstChange) {
      this.previewId = null;
    }
  }

  get activeId(): number | null {
    return this.previewId ?? this.selectedId;
  }

  get columns(): Column[] {
    const articles = this.shownArticles;
    return BIAS_AXIS.map((point) => {
      const matches = articles.filter((article) => article.bias === point.id);
      return {
        id: point.id,
        shown: matches.slice(0, VISIBLE),
        extra: Math.max(0, matches.length - VISIBLE)
      };
    });
  }

  get summary(): string {
    const dist = this.activeDistribution;
    if (!dist || dist.trackedTotal === 0) {
      return 'No tracked sources';
    }
    let lead = { label: 'Center', pct: dist.centerPct };
    if (dist.leftPct > lead.pct) {
      lead = { label: 'Left', pct: dist.leftPct };
    }
    if (dist.rightPct > lead.pct) {
      lead = { label: 'Right', pct: dist.rightPct };
    }
    return `${lead.pct}% of the sources are ${lead.label}`;
  }

  get barSides(): { id: string; label: string; pct: number }[] {
    const dist = this.activeDistribution;
    if (!dist) {
      return [];
    }
    return [
      { id: 'left', label: 'L', pct: dist.leftPct },
      { id: 'center', label: 'C', pct: dist.centerPct },
      { id: 'right', label: 'R', pct: dist.rightPct }
    ].filter((side) => side.pct > 0);
  }

  logo(article: Article): string | null {
    if (this.hiddenLogos.has(article.domain)) {
      return null;
    }
    return logoForDomain(article.domain);
  }

  hideLogo(domain: string): void {
    this.hiddenLogos.add(domain);
  }

  mark(article: Article): string {
    const wordmark = skinForDomain(article.domain).wordmark || article.outletName;
    const words = wordmark.split(/\s+/).filter((word) => !/^(the|news)$/i.test(word));
    const first = words[0] ?? wordmark;
    if (first.length <= 4) {
      return first.toUpperCase();
    }
    const second = words[1];
    if (second) {
      return (first[0] + second[0]).toUpperCase();
    }
    return first.slice(0, 3).toUpperCase();
  }

  choose(id: number): void {
    if (id < 0) {
      this.previewId = id;
      return;
    }
    this.previewId = null;
    this.selectArticle.emit(id);
  }

  private get shownArticles(): Article[] {
    if (!SHOW_MOCK_SOURCES) {
      return this.articles;
    }
    const domains = new Set(this.articles.map((article) => article.domain));
    const extras = BIAS_MOCK_ARTICLES.filter((article) => !domains.has(article.domain));
    return [...this.articles, ...extras];
  }

  private get activeDistribution(): BiasDistribution | null {
    if (!SHOW_MOCK_SOURCES) {
      return this.distribution;
    }
    return distributionFrom(this.shownArticles);
  }
}

function distributionFrom(articles: Article[]): BiasDistribution {
  let left = 0;
  let center = 0;
  let right = 0;
  let untracked = 0;
  for (const article of articles) {
    const side = biasSide(article.bias);
    if (side === 'LEFT') {
      left++;
    } else if (side === 'CENTER') {
      center++;
    } else if (side === 'RIGHT') {
      right++;
    } else {
      untracked++;
    }
  }
  const tracked = left + center + right;
  const leftPct = tracked === 0 ? 0 : Math.round((left * 100) / tracked);
  const centerPct = tracked === 0 ? 0 : Math.round((center * 100) / tracked);
  const rightPct = tracked === 0 ? 0 : Math.max(0, 100 - leftPct - centerPct);
  return {
    left,
    center,
    right,
    untracked,
    trackedTotal: tracked,
    leftPct,
    centerPct,
    rightPct
  };
}
