import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { FOR_YOU_TOPIC_ID, findSubtopic, TOPICS, Subtopic, Topic } from './topics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Did you hear the news';
  today = new Date();
  readonly topics = TOPICS;
  readonly footerColumns: { label: string; topics: Topic[] }[] = [
    { label: 'News', topics: TOPICS.slice(0, 5) },
    { label: 'Ideas', topics: TOPICS.slice(5, 10) },
    { label: 'Life', topics: TOPICS.slice(10) }
  ];
  selectedTopicId = FOR_YOU_TOPIC_ID;
  selectedSubtopicId: string | null = null;
  openTopicId: string | null = null;
  panelTop = 0;
  panelLeft = 0;
  private querySub?: Subscription;
  private closeTimer?: number;
  private ignoreNextFocus = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.querySub = this.route.queryParamMap.subscribe((params) => {
      const id = params.get('topic');
      this.selectedTopicId = TOPICS.some((topic) => topic.id === id) ? id! : FOR_YOU_TOPIC_ID;
      this.selectedSubtopicId = findSubtopic(this.selectedTopicId, params.get('subtopic'))?.id ?? null;
    });
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
    this.cancelClose();
  }

  get openTopic(): Topic | undefined {
    return this.topics.find((topic) => topic.id === this.openTopicId);
  }

  openMenu(topic: Topic, event: Event): void {
    if (this.ignoreNextFocus) {
      this.ignoreNextFocus = false;
      return;
    }
    if (topic.groups.length === 0) {
      this.closeMenu();
      return;
    }
    this.cancelClose();
    const anchor = event.currentTarget as HTMLElement;
    const rect = anchor.getBoundingClientRect();
    const estimatedWidth = topic.groups.length * 200;
    const maxLeft = window.innerWidth - estimatedWidth - 8;
    this.panelTop = rect.bottom + 8;
    this.panelLeft = Math.max(8, Math.min(rect.left, maxLeft));
    this.openTopicId = topic.id;
    requestAnimationFrame(() => this.clampPanel());
  }

  scheduleClose(): void {
    this.cancelClose();
    this.closeTimer = window.setTimeout(() => this.closeMenu(), 150);
  }

  cancelClose(): void {
    if (this.closeTimer !== undefined) {
      window.clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
    }
  }

  closeMenu(): void {
    this.cancelClose();
    this.openTopicId = null;
  }

  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const nav = event.currentTarget as HTMLElement;
    if (next && nav.contains(next)) {
      return;
    }
    this.scheduleClose();
  }

  onChipKeydown(event: KeyboardEvent, topic: Topic): void {
    if (event.key !== 'Tab' || event.shiftKey || this.openTopicId !== topic.id) {
      return;
    }
    const first = document.querySelector<HTMLElement>('#topic-panel .topic-panel-link');
    if (!first) {
      return;
    }
    event.preventDefault();
    first.focus();
  }

  onPanelKeydown(event: KeyboardEvent, topic: Topic): void {
    if (event.key !== 'Tab') {
      return;
    }
    const links = Array.from(document.querySelectorAll<HTMLElement>('#topic-panel .topic-panel-link'));
    const index = links.indexOf(document.activeElement as HTMLElement);
    if (event.shiftKey && index === 0) {
      event.preventDefault();
      this.chipButton(topic.id)?.focus();
      return;
    }
    if (!event.shiftKey && index === links.length - 1) {
      event.preventDefault();
      this.focusChipAfter(topic.id);
    }
  }

  selectTopic(topic: Topic): void {
    if (topic.id !== FOR_YOU_TOPIC_ID && topic.id === this.selectedTopicId && this.selectedSubtopicId) {
      this.router.navigate(['/'], { queryParams: { topic: topic.id } });
      return;
    }
    const clear = topic.id === FOR_YOU_TOPIC_ID || topic.id === this.selectedTopicId;
    this.router.navigate(['/'], {
      queryParams: clear ? {} : { topic: topic.id }
    });
  }

  selectSubtopic(topic: Topic, subtopic: Subtopic): void {
    this.closeMenu();
    this.router.navigate(['/'], {
      queryParams: { topic: topic.id, subtopic: subtopic.id }
    });
  }

  isCurrentSubtopic(topic: Topic, subtopic: Subtopic): boolean {
    return topic.id === this.selectedTopicId && subtopic.id === this.selectedSubtopicId;
  }

  topicQuery(topic: Topic): { topic: string } | null {
    return topic.id === FOR_YOU_TOPIC_ID ? null : { topic: topic.id };
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.openTopicId) {
      return;
    }
    const chip = this.chipButton(this.openTopicId);
    const returnFocus = document.activeElement !== chip;
    this.closeMenu();
    if (returnFocus && chip) {
      this.ignoreNextFocus = true;
      chip.focus();
    }
  }

  private clampPanel(): void {
    const panel = document.getElementById('topic-panel');
    if (!panel || !this.openTopicId) {
      return;
    }
    const maxLeft = window.innerWidth - panel.offsetWidth - 8;
    const next = Math.max(8, Math.min(this.panelLeft, maxLeft));
    if (next !== this.panelLeft) {
      this.panelLeft = next;
      this.changeDetector.detectChanges();
    }
  }

  private chipButton(topicId: string): HTMLElement | null {
    return document.querySelector(`[data-topic-id="${topicId}"]`);
  }

  private focusChipAfter(topicId: string): void {
    const index = this.topics.findIndex((topic) => topic.id === topicId);
    const next = this.topics[index + 1];
    if (!next) {
      this.closeMenu();
      return;
    }
    this.chipButton(next.id)?.focus();
  }
}
