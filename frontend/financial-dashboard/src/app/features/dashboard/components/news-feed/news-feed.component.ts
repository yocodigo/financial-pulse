import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

@Component({
  selector: 'app-news-feed',
  templateUrl: './news-feed.component.html',
  styleUrls: ['./news-feed.component.scss']
})
export class NewsFeedComponent implements OnInit, OnDestroy {
  newsItems: NewsItem[] = [];
  loading = false;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadNews();
    // Refresh news every 15 minutes
    this.subscription.add(
      setInterval(() => this.loadNews(), 15 * 60 * 1000)
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadNews(): void {
    this.loading = true;
    this.error = null;

    this.subscription.add(
      this.apiService.get<NewsItem[]>('/news').subscribe({
        next: (data) => {
          this.newsItems = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load news. Please try again later.';
          this.loading = false;
          console.error('News feed error:', error);
        }
      })
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  openNewsUrl(url: string): void {
    window.open(url, '_blank');
  }
}
