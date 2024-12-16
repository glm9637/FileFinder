import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ModeToggleComponent } from '../../../core/mode-toggle/mode-toggle.component';
import { CommonModule } from '@angular/common';
import { ArticleInputComponent } from '../../../core/article-input/article-input.component';

@Component({
  selector: 'app-topbar',
  imports: [ModeToggleComponent, ArticleInputComponent, CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  public readonly searchTriggered = output<string>();
}
