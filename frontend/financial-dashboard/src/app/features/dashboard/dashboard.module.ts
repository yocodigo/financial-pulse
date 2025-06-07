import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PortfolioSummaryComponent } from './components/portfolio-summary/portfolio-summary.component';
import { MarketOverviewComponent } from './components/market-overview/market-overview.component';
import { NewsFeedComponent } from './components/news-feed/news-feed.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: PortfolioSummaryComponent
      },
      {
        path: 'market',
        component: MarketOverviewComponent
      },
      {
        path: 'news',
        component: NewsFeedComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    PortfolioSummaryComponent,
    MarketOverviewComponent,
    NewsFeedComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule
  ]
})
export class DashboardModule { }
