import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModeToggleComponent } from '../core/mode-toggle/mode-toggle.component';
import { ArticleInputComponent } from '../core/article-input/article-input.component';
import { Store } from '@ngxs/store';
import { SetNumber } from '../state/article/article.actions';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ModeToggleComponent, ArticleInputComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private store = inject(Store);
  public handleSearch(article: string): void {
    this.store.dispatch(new SetNumber(article));
  }
}
