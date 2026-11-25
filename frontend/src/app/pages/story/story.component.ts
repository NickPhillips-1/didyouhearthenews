import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, Subscription, catchError, switchMap } from 'rxjs';
import {
  biasSide,
  centerFirst,
  defaultArticle,
  factCheckUrl,
  leadSentence,
  spectrumOrder
} from '../../bias-axis';
import { BiasDistributionComponent } from '../../bias-distribution/bias-distribution.component';
import { Article, BiasSide, Story } from '../../models';
import { StoryApiService } from '../../story-api.service';
import { StoryArticleTrackComponent } from '../../story-article-track/story-article-track.component';

interface BriefingLine {
  id: number;
  text: string;
  outlet: string;
  url: string;
  bias: string;
}

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [RouterLink, StoryArticleTrackComponent, BiasDistributionComponent],
  templateUrl: './story.component.html',
  styleUrl: './story.component.css'
})
export class StoryComponent implements OnInit, OnDestroy {
  story: Story | null = null;
  articles: Article[] = [];
  loading = true;
  error: string | null = null;
  selectedArticleId: number | null = null;
  overviewSide: BiasSide = 'CENTER';
  liveMessage = '';
  readonly overviewSides: { id: BiasSide; label: string }[] = [
    { id: 'LEFT', label: 'Left' },
    { id: 'CENTER', label: 'Center' },
    { id: 'RIGHT', label: 'Right' }
  ];

  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private api: StoryApiService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.pipe(
      switchMap((params) => {
        const raw = params.get('id');
        const id = Number(raw);
        this.resetForNavigation();
        if (!raw || !Number.isFinite(id) || id <= 0) {
          this.loading = false;
          this.error = 'Story not found.';
          return EMPTY;
        }
        return this.api.get(id).pipe(
          catchError(() => {
            this.story = null;
            this.loading = false;
            this.error = 'Story not found.';
            return EMPTY;
          })
        );
      })
    ).subscribe((story) => {
      this.story = story;
      this.articles = spectrumOrder(story.articles);
      const picked = defaultArticle(this.articles);
      this.selectedArticleId = picked?.id ?? null;
      this.overviewSide = (picked && biasSide(picked.bias)) || 'CENTER';
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  briefing(): BriefingLine[] {
    return centerFirst(this.articles)
      .filter((article) => biasSide(article.bias) === this.overviewSide)
      .filter((article) => article.fetchStatus === 'OK' && !!article.excerpt?.trim())
      .map((article) => ({
        id: article.id,
        text: leadSentence(article.excerpt!),
        outlet: article.outletName,
        url: article.url,
        bias: article.bias
      }));
  }

  sideHasCoverage(side: BiasSide): boolean {
    return this.articles.some((article) => biasSide(article.bias) === side);
  }

  setOverviewSide(side: BiasSide): void {
    this.overviewSide = side;
    const match = this.articles.find((article) => biasSide(article.bias) === side);
    if (match) {
      this.selectArticle(match.id);
      return;
    }
    this.liveMessage = this.emptyOverview();
  }

  emptyOverview(): string {
    switch (this.overviewSide) {
      case 'LEFT':
        return 'No left-leaning coverage to compare yet.';
      case 'CENTER':
        return 'No center coverage to compare yet.';
      case 'RIGHT':
        return 'No right-leaning coverage to compare yet.';
    }
  }

  onOverviewKey(event: KeyboardEvent): void {
    const order = this.overviewSides.map((side) => side.id);
    const index = order.indexOf(this.overviewSide);
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const next = event.key === 'ArrowRight'
        ? order[(index + 1) % order.length]
        : order[(index - 1 + order.length) % order.length];
      this.setOverviewSide(next);
      queueMicrotask(() => document.getElementById(`overview-${next}`)?.focus());
    }
  }

  selectArticle(id: number, announce = true): void {
    if (this.selectedArticleId === id) {
      return;
    }
    this.selectedArticleId = id;
    const article = this.articles.find((item) => item.id === id);
    const side = article ? biasSide(article.bias) : null;
    if (side) {
      this.overviewSide = side;
    }
    if (announce) {
      this.liveMessage = this.announcement(id);
    }
  }

  factCheck(article: Article): string {
    return factCheckUrl(article.title, article.url);
  }

  sourceCount(count: number): string {
    return `${count} ${count === 1 ? 'source' : 'sources'}`;
  }

  private announcement(id: number): string {
    const articles = this.articles;
    const index = articles.findIndex((article) => article.id === id);
    const article = articles[index];
    if (!article) {
      return '';
    }
    return `${article.outletName}, ${article.biasLabel}, ${index + 1} of ${articles.length}`;
  }

  private resetForNavigation(): void {
    this.loading = true;
    this.error = null;
    this.story = null;
    this.articles = [];
    this.selectedArticleId = null;
    this.overviewSide = 'CENTER';
    this.liveMessage = '';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }
}
