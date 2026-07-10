import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  template: `
    <div class="skeleton-card">
      <div class="skeleton-image pulse"></div>
      <div class="skeleton-content">
        <div class="skeleton-title pulse"></div>
        <div class="skeleton-text pulse"></div>
        <div class="skeleton-text short pulse"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-card {
      background: white;
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.04);
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    .skeleton-image {
      height: 260px;
      width: 100%;
      background: #e0e0e0;
      flex-shrink: 0;
    }

    .skeleton-content {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex-grow: 1;
    }

    .skeleton-title {
      height: 24px;
      width: 70%;
      background: #e0e0e0;
      border-radius: 4px;
    }

    .skeleton-text {
      height: 16px;
      width: 100%;
      background: #e0e0e0;
      border-radius: 4px;

      &.short {
        width: 60%;
      }
    }

    .pulse {
      animation: pulse 1.5s infinite ease-in-out;
    }

    @keyframes pulse {
      0% {
        background-color: #f0f0f0;
      }
      50% {
        background-color: #e0e0e0;
      }
      100% {
        background-color: #f0f0f0;
      }
    }
  `]
})
export class SkeletonCardComponent {}
