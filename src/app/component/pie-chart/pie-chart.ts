import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Slice {
  label: string;
  percentage: number;
  path: string;
  color: string;
  tooltip: string;
}

@Component({
  standalone: true,
  selector: 'app-pie-chart',
  imports: [CommonModule],
  template: `
    <div class="pie-wrap" *ngIf="slices.length > 0">
      <svg viewBox="0 0 200 200" class="pie-svg" xmlns="http://www.w3.org/2000/svg">
        <path
          *ngFor="let s of slices"
          [attr.d]="s.path"
          [attr.fill]="s.color"
          [attr.aria-label]="s.tooltip"
          class="pie-slice">
        </path>
        <!-- donut hole -->
        <circle cx="100" cy="100" r="50" fill="#fff" />
      </svg>
      <div class="pie-legend">
        <div class="legend-item" *ngFor="let s of slices" [title]="s.tooltip">
          <span class="legend-dot" [style.background]="s.color"></span>
          <span class="legend-label">{{ s.label }}</span>
          <span class="legend-pct">{{ s.percentage | number:'1.1-1' }}%</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pie-wrap {
      display: flex;
      align-items: flex-start;
      gap: 24px;
      flex-wrap: wrap;
    }
    .pie-svg {
      width: 180px;
      height: 180px;
      flex-shrink: 0;
    }
    .pie-slice {
      stroke: #fff;
      stroke-width: 1.5;
      transition: opacity 0.15s;
      cursor: pointer;
    }
    .pie-slice:hover { opacity: 0.82; }
    .pie-legend {
      display: flex;
      flex-direction: column;
      gap: 6px;
      justify-content: center;
      min-width: 140px;
      font-family: "Segoe UI", system-ui, -apple-system, "Noto Sans", sans-serif;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      cursor: default;
    }
    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .legend-label {
      flex: 1;
      color: #333;
    }
    .legend-pct {
      color: #888;
      font-size: 12px;
      min-width: 40px;
      text-align: right;
    }
  `],
})
export class PieChartComponent implements OnChanges {
  @Input() labels: string[] = [];
  @Input() values: number[] | null = null;

  slices: Slice[] = [];

  private readonly COLORS = [
    '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
    '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac',
    '#54a0ff', '#ff6b6b', '#48dbfb', '#1dd1a1', '#feca57',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['labels'] || changes['values']) {
      this.buildSlices();
    }
  }

  private buildSlices(): void {
    const rawLabels = this.labels ?? [];
    const n = rawLabels.length;
    if (!n) { this.slices = []; return; }

    // Normalize Unicode NFC to ensure Vietnamese chars render correctly
    const labels = rawLabels.map(l => (typeof l === 'string' ? l.normalize('NFC') : String(l)));

    const vals = this.values?.length === n ? this.values : Array(n).fill(1);
    const total = vals.reduce((a, b) => a + b, 0) || 1;

    let currentAngle = -Math.PI / 2;
    this.slices = labels.map((label, i) => {
      const ratio = vals[i] / total;
      const angle = ratio * 2 * Math.PI;
      const startAngle = currentAngle;
      currentAngle += angle;
      const endAngle = currentAngle;

      const cx = 100, cy = 100, r = 90;
      const path = n === 1
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`
        : (() => {
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            const large = angle > Math.PI ? 1 : 0;
            return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
          })();

      const pct = (ratio * 100).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      return {
        label,
        percentage: ratio * 100,
        path,
        color: this.COLORS[i % this.COLORS.length],
        tooltip: `${label}: ${pct}%`,
      };
    });
  }
}
