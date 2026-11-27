import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-tooltip',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="tooltip-container" tabindex="0" role="tooltip" [attr.aria-label]="texto">
      <span class="icon-help">?</span>
      <span class="tooltip-bubble" [ngClass]="posicion">
        <strong *ngIf="titulo" class="bubble-title">{{ titulo }}</strong>
        <span class="bubble-text">{{ texto }}</span>
        <small *ngIf="ejemplo" class="bubble-example">Ej: {{ ejemplo }}</small>
      </span>
    </span>
  `,
  styles: [`
    .tooltip-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: help;
      margin-left: 0.35rem;
      vertical-align: middle;
      outline: none;

      .icon-help {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #e2e8f0;
        color: #475569;
        font-size: 10.5px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        border: 1px solid #cbd5e1;
      }

      &:hover .icon-help,
      &:focus .icon-help {
        background: #0284c7;
        color: #ffffff;
        border-color: #0284c7;
        box-shadow: 0 0 6px rgba(2, 132, 199, 0.4);
      }

      .tooltip-bubble {
        visibility: hidden;
        opacity: 0;
        width: 230px;
        background: #0f172a;
        color: #f8fafc;
        text-align: left;
        border-radius: 8px;
        padding: 0.65rem 0.8rem;
        position: absolute;
        z-index: 1000;
        font-size: 0.76rem;
        line-height: 1.35;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
        border: 1px solid #334155;
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
        transform: translateY(4px);

        &.top {
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%) translateY(4px);
        }
        &.right {
          left: 125%;
          top: 50%;
          transform: translateY(-50%) translateX(-4px);
        }

        .bubble-title {
          display: block;
          color: #38bdf8;
          font-weight: 700;
          margin-bottom: 0.25rem;
          font-size: 0.78rem;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 0.2rem;
        }

        .bubble-text {
          display: block;
          color: #e2e8f0;
        }

        .bubble-example {
          display: block;
          margin-top: 0.35rem;
          color: #94a3b8;
          font-style: italic;
          font-family: monospace;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.15rem 0.35rem;
          border-radius: 4px;
        }
      }

      &:hover .tooltip-bubble,
      &:focus .tooltip-bubble {
        visibility: visible;
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
  `]
})
export class InfoTooltipComponent {
  @Input() titulo: string = '';
  @Input() texto: string = '';
  @Input() ejemplo: string = '';
  @Input() posicion: 'top' | 'right' = 'top';
}