import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found-page">
      <div class="content-box">
        <span class="status-code">404</span>
        <h1>Page Not <em>Found</em></h1>
        <p>The page or luxury piece you are looking for has been moved, archived, or is currently unavailable.</p>
        <div class="action-row">
          <a routerLink="/" class="btn-primary">Return to Home</a>
          <a routerLink="/search" class="btn-secondary">Browse All Collections</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
    }
    .content-box {
      max-width: 500px;
    }
    .status-code {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 5rem;
      font-weight: 700;
      color: #9f803c;
      line-height: 1;
      display: block;
      margin-bottom: 0.5rem;
    }
    h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2.2rem;
      margin: 0 0 1rem;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .action-row {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-primary {
      padding: 12px 24px;
      background: #171513;
      color: #fff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .btn-secondary {
      padding: 12px 24px;
      border: 1px solid #dcd4ca;
      color: #333;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.9rem;
    }
  `]
})
export class NotFoundComponent {}
