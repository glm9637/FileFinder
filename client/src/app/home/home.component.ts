import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModeToggleComponent } from '../core/mode-toggle/mode-toggle.component';
import { ArticleInputComponent } from '../core/article-input/article-input.component';
import { Router } from '@angular/router';
import { ScannerService } from '../core/scanner.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ModeToggleComponent, ArticleInputComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly article = toSignal(inject(ScannerService).article$);
  private readonly scannerEffect = effect(() => {
    const article = this.article();
    console.log(article);
    if (article != null) {
      this.handleSearch(article);
    }
  });
  public handleSearch(article: string): void {
    this.router.navigate([article]);
  }
}
