import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BiasDistribution, BiasSide } from '../models';

interface BarSide {
  id: BiasSide;
  label: string;
  short: string;
  pct: (distribution: BiasDistribution) => number;
}

/** Left / Center / Right coverage bar with an untracked note. */
@Component({
  selector: 'app-bias-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bias-bar.component.html',
  styleUrl: './bias-bar.component.css'
})
export class BiasBarComponent {
  @Input({ required: true }) distribution!: BiasDistribution;
  @Input() compact = false;
  /** `strip` is the home-page thin bar with labels underneath. `default` is the story page. */
  @Input() appearance: 'default' | 'strip' = 'default';
  /** Story page only. Home strips and compact source bars stay inert. */
  @Input() selectable = false;
  @Input() selected: BiasSide | null = null;
  @Output() sideChange = new EventEmitter<BiasSide>();

  readonly sides: readonly BarSide[] = [
    { id: 'LEFT', label: 'Left', short: 'L', pct: (d) => d.leftPct },
    { id: 'CENTER', label: 'Center', short: 'C', pct: (d) => d.centerPct },
    { id: 'RIGHT', label: 'Right', short: 'R', pct: (d) => d.rightPct }
  ];

  get isStrip(): boolean {
    return this.appearance === 'strip';
  }

  pct(side: BarSide): number {
    return side.pct(this.distribution);
  }

  choose(side: BiasSide): void {
    this.sideChange.emit(side);
  }
}
