import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Article, BiasDistribution } from '../models';
import { BiasBarComponent } from '../bias-bar/bias-bar.component';
import { OutletSkin, skinForDomain } from './outlet-skins';

/**
 * One article drawn in its outlet's look. The bias rating stays in our chrome:
 * a bar on the default card, a corner stamp on a magazine leaf. Below it the
 * card mimics that outlet's masthead and headline hierarchy. Content comes only
 * from the fields the API already returns.
 */
@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [CommonModule, BiasBarComponent],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.css'
})
export class ArticleCardComponent {
  private readonly _article = signal<Article | null>(null);
  /** Set when the remote image fails to load, so the card falls back to text. */
  imageHidden = false;

  /** `spread` is the magazine leaf: corner stamp, bleed photo, no card chrome. */
  @Input() density: 'default' | 'spread' = 'default';

  @Input({ required: true }) set article(value: Article) {
    this._article.set(value);
    this.imageHidden = false;
  }
  get article(): Article {
    return this._article()!;
  }

  readonly skin = computed<OutletSkin>(() => skinForDomain(this._article()?.domain ?? ''));

  hideImage(): void {
    this.imageHidden = true;
  }

  /** The masthead label: the skin wordmark, or the outlet/domain for untracked. */
  readonly wordmark = computed<string>(() => {
    const a = this._article();
    return this.skin().wordmark ?? a?.outletName ?? a?.domain ?? '';
  });

  /** A single-source distribution so the shared bias bar renders this one rating. */
  readonly sourceDistribution = computed<BiasDistribution>(() => {
    const bias = this._article()?.bias ?? 'UNTRACKED';
    const left = bias === 'LEFT' || bias === 'LEAN_LEFT';
    const center = bias === 'CENTER';
    const right = bias === 'RIGHT' || bias === 'LEAN_RIGHT';
    const tracked = left || center || right;
    return {
      left: left ? 1 : 0,
      center: center ? 1 : 0,
      right: right ? 1 : 0,
      untracked: tracked ? 0 : 1,
      trackedTotal: tracked ? 1 : 0,
      leftPct: left ? 100 : 0,
      centerPct: center ? 100 : 0,
      rightPct: right ? 100 : 0
    };
  });
}
