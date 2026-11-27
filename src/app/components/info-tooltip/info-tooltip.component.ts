import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-tooltip',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="tooltip-wrapper" tabindex="0" role="tooltip">
      <span class="tooltip-trigger">?</span>
      <span class="tooltip-card" [ngClass]="posicion">
        <strong *ngIf="titulo" class="tooltip-header">{{ titulo }}</strong>
        <span class="tooltip-body">{{ texto }}</span>
        <small *ngIf="ejemplo" class="tooltip-example">💡 {{ ejemplo }}</small>
      </span>
    </span>
  `,
  styles: [`
    .tooltip-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: help;
      margin-left: 0.4rem;
      vertical-align: middle;
      outline: none;
      z-index: 50;

      .tooltip-trigger {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #0284c7;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        font-family: system-ui, sans-serif;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        transition: transform 0.15s ease, background-color 0.15s ease;
      }

      &:hover .tooltip-trigger,
      &:focus .tooltip-trigger {
        background: #38bdf8;
        transform: scale(1.15);
      }

      .tooltip-card {
        visibility: hidden;
        opacity: 0;
        width: 240px;
        background: #09121d;
        color: #f1f5f9;
        text-align: left;
        border-radius: 8px;
        padding: 0.7rem 0.85rem;
        position: absolute;
        z-index: 999999 !important;
        font-size: 0.76rem;
        line-height: 1.4;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6);
        border: 1px solid #334155;
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
        white-space: normal;

        &.top {
          bottom: 135%;
          left: 50%;
          transform: translateX(-50%) translateY(4px);
        }

        &.bottom {
          top: 135%;
          left: 50%;
          transform: translateX(-50%) translateY(-4px);
        }

        &.left {
          right: 135%;
          top: 50%;
          transform: translateY(-50%) translateX(4px);
        }

        &.right {
          left: 135%;
          top: 50%;
          transform: translateY(-50%) translateX(-4px);
        }

        .tooltip-header {
          display: block;
          color: #38bdf8;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 0.2rem;
        }

        .tooltip-body {
          display: block;
          color: #cbd5e1;
        }

        .tooltip-example {
          display: block;
          margin-top: 0.35rem;
          color: #94a3b8;
          font-style: italic;
          background: rgba(255, 255, 255, 0.06);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
        }
      }

      &:hover .tooltip-card,
      &:focus .tooltip-card {
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
  @Input() posicion: 'top' | 'bottom' | 'left' | 'right' = 'top';
}