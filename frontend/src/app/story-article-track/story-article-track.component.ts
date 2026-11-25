import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import { Article } from '../models';

const STRIP_PX = 120;
const GAP_PX = 12;
const SLOP_PX = 10;
const COMMIT_PX = 48;

interface PointerGesture {
  id: number;
  x: number;
  y: number;
  dragging: boolean;
}

/**
 * One wide source and the rest as image strips clipped on the right.
 * The parent owns selection.
 */
@Component({
  selector: 'app-story-article-track',
  standalone: true,
  templateUrl: './story-article-track.component.html',
  styleUrl: './story-article-track.component.css'
})
export class StoryArticleTrackComponent implements OnChanges, OnDestroy {
  @Input() articles: Article[] = [];
  @Input() selectedId: number | null = null;
  @Output() selectedChange = new EventEmitter<number>();

  readonly strip = STRIP_PX;
  readonly gap = GAP_PX;

  dragging = false;
  dragPx = 0;
  private hiddenImages = new Set<number>();
  private gesture: PointerGesture | null = null;
  private suppressClick = false;
  private removePointerListeners: (() => void) | null = null;

  constructor(private zone: NgZone) {}

  get index(): number {
    const found = this.articles.findIndex((article) => article.id === this.selectedId);
    return found < 0 ? 0 : found;
  }

  get atStart(): boolean {
    return this.articles.length === 0 || this.index <= 0;
  }

  get atEnd(): boolean {
    return this.articles.length < 2 || this.index >= this.articles.length - 1;
  }

  get rowTransform(): string {
    const x = -this.index * (STRIP_PX + GAP_PX) + this.dragPx;
    return `translate3d(${x}px, 0, 0)`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['articles']) {
      this.hiddenImages = new Set();
    }
    if (changes['selectedId'] && this.dragging) {
      this.cancelDrag();
    }
  }

  ngOnDestroy(): void {
    this.removePointerListeners?.();
  }

  isWide(article: Article): boolean {
    return article.id === this.articles[this.index]?.id;
  }

  showImage(article: Article): boolean {
    return !!article.imageUrl && !this.hiddenImages.has(article.id);
  }

  hideImage(id: number): void {
    if (this.hiddenImages.has(id)) {
      return;
    }
    const next = new Set(this.hiddenImages);
    next.add(id);
    this.hiddenImages = next;
  }

  select(id: number): void {
    if (this.suppressClick || id === this.selectedId) {
      return;
    }
    this.selectedChange.emit(id);
  }

  step(direction: 1 | -1): void {
    const article = this.articles[this.index + direction];
    if (article) {
      this.selectedChange.emit(article.id);
    }
  }

  onKey(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select')) {
      return;
    }
    event.preventDefault();
    this.step(event.key === 'ArrowRight' ? 1 : -1);
  }

  onPointerDown(event: PointerEvent): void {
    if (this.articles.length < 2 || event.button !== 0) {
      return;
    }
    this.gesture = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      dragging: false
    };
    this.listenForPointer(event.pointerId);
  }

  onClick(event: MouseEvent): void {
    if (!this.suppressClick) {
      return;
    }
    this.suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }

  private listenForPointer(pointerId: number): void {
    this.removePointerListeners?.();
    const move = (event: PointerEvent) => {
      if (event.pointerId === pointerId) {
        this.onPointerMove(event);
      }
    };
    const up = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) {
        return;
      }
      this.removePointerListeners?.();
      this.onPointerUp(event);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
    this.removePointerListeners = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      this.removePointerListeners = null;
    };
  }

  private onPointerMove(event: PointerEvent): void {
    const gesture = this.gesture;
    if (!gesture || gesture.id !== event.pointerId) {
      return;
    }
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.dragging) {
      if (Math.hypot(dx, dy) < SLOP_PX) {
        return;
      }
      if (Math.abs(dy) > Math.abs(dx)) {
        this.gesture = null;
        this.removePointerListeners?.();
        return;
      }
      gesture.dragging = true;
      this.suppressClick = true;
    }
    const limited = this.limitDrag(dx);
    this.zone.run(() => {
      this.dragging = true;
      this.dragPx = limited;
    });
  }

  private onPointerUp(event: PointerEvent): void {
    const gesture = this.gesture;
    this.gesture = null;
    if (!gesture || gesture.id !== event.pointerId || !gesture.dragging) {
      return;
    }
    const dx = this.dragPx;
    this.zone.run(() => {
      this.dragging = false;
      this.dragPx = 0;
      if (dx <= -COMMIT_PX) {
        this.step(1);
      } else if (dx >= COMMIT_PX) {
        this.step(-1);
      }
    });
  }

  private limitDrag(dx: number): number {
    if ((dx < 0 && this.atEnd) || (dx > 0 && this.atStart)) {
      return dx * 0.35;
    }
    return dx;
  }

  private cancelDrag(): void {
    this.dragging = false;
    this.dragPx = 0;
    this.gesture = null;
    this.removePointerListeners?.();
  }
}
