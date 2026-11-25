import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { StoryApiService } from '../../story-api.service';
import { Story, StorySummary } from '../../models';
import { BiasBarComponent } from '../../bias-bar/bias-bar.component';
import { BiasDistributionComponent } from '../../bias-distribution/bias-distribution.component';
import { FOR_YOU_TOPIC_ID, storyMatchesTopic, topicLabel, TOPICS } from '../../topics';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, BiasBarComponent, BiasDistributionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  listError: string | null = null;

  stories: StorySummary[] = [];
  loadingList = true;
  /** Lead story with articles, when that story has tracked sources. */
  leadCurve: Story | null = null;
  topicId = FOR_YOU_TOPIC_ID;
  subtopicId: string | null = null;
  private hiddenImages = new Set<number>();
  private querySub?: Subscription;
  private leadSub?: Subscription;
  private leadRequest = 0;
  private fetchingLeadId: number | null = null;

  constructor(
    private api: StoryApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.querySub = this.route.queryParamMap.subscribe((params) => {
      const id = params.get('topic');
      this.topicId = id && TOPICS.some((topic) => topic.id === id) ? id : FOR_YOU_TOPIC_ID;
      this.subtopicId = params.get('subtopic');
      this.syncLeadCurve();
    });
    this.loadStories();
  }

  ngOnDestroy(): void {
    this.leadRequest++;
    this.querySub?.unsubscribe();
    this.leadSub?.unsubscribe();
  }

  get visibleStories(): StorySummary[] {
    return this.stories.filter((story) => storyMatchesTopic(story.title, this.topicId, this.subtopicId));
  }

  get activeTopicLabel(): string {
    return topicLabel(this.topicId, this.subtopicId);
  }

  get lead(): StorySummary | undefined {
    return this.visibleStories[0];
  }

  get developingStories(): StorySummary[] {
    return this.visibleStories.slice(1, 4);
  }

  get columnStories(): StorySummary[] {
    return this.visibleStories.slice(4, 8);
  }

  get restStories(): StorySummary[] {
    return this.visibleStories.slice(8);
  }

  get railStories(): StorySummary[] {
    return this.visibleStories.slice(0, 10);
  }

  showImage(story: StorySummary): boolean {
    return !!story.imageUrl && !this.hiddenImages.has(story.id);
  }

  hideImage(id: number): void {
    this.hiddenImages.add(id);
  }

  sourceCount(count: number): string {
    return `${count} ${count === 1 ? 'source' : 'sources'}`;
  }

  /** Leading side of the coverage, e.g. "50% Center coverage: 6 sources". */
  coverageLine(story: StorySummary): string {
    const count = this.sourceCount(story.articleCount);
    const dist = story.distribution;
    if (!dist || dist.trackedTotal === 0) {
      return `Coverage: ${count}`;
    }
    const sides = [
      { side: 'Left', pct: dist.leftPct },
      { side: 'Center', pct: dist.centerPct },
      { side: 'Right', pct: dist.rightPct }
    ];
    const top = sides.reduce((a, b) => (b.pct > a.pct ? b : a));
    if (top.pct <= 0) {
      return `Coverage: ${count}`;
    }
    return `${top.pct}% ${top.side} coverage: ${count}`;
  }

  /** Load outlets for the visible lead. A newer lead drops the previous response. */
  private syncLeadCurve(): void {
    const id = this.lead?.id ?? null;
    if (id == null) {
      this.leadRequest++;
      this.fetchingLeadId = null;
      this.leadSub?.unsubscribe();
      this.leadCurve = null;
      return;
    }
    if (this.leadCurve?.id === id || this.fetchingLeadId === id) {
      return;
    }
    const request = ++this.leadRequest;
    this.fetchingLeadId = id;
    this.leadCurve = null;
    this.leadSub?.unsubscribe();
    this.leadSub = this.api.get(id).subscribe({
      next: (story) => {
        if (request !== this.leadRequest) {
          return;
        }
        this.fetchingLeadId = null;
        this.leadCurve = story.distribution.trackedTotal > 0 ? story : null;
      },
      error: () => {
        if (request !== this.leadRequest) {
          return;
        }
        this.fetchingLeadId = null;
        this.leadCurve = null;
      }
    });
  }

  loadStories(): void {
    this.loadingList = true;
    this.listError = null;
    this.api.list().subscribe({
      next: (stories) => {
        this.stories = stories;
        this.loadingList = false;
        this.syncLeadCurve();
      },
      error: () => {
        this.stories = [];
        this.loadingList = false;
        this.listError = 'Could not load stories. Is the backend running?';
        this.syncLeadCurve();
      }
    });
  }
}
