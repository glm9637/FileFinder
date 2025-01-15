import { CommonModule } from '@angular/common';
import { Component, effect, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-article-input',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './article-input.component.html',
  styleUrl: './article-input.component.scss',
})
export class ArticleInputComponent {
  public disabled = input(false);
  public value = input('');

  public valueSet = effect(() => {
    const number = this.value();
    this.searchForm.setValue(number);
  });

  public disabledSet = effect(() => {
    if (this.disabled()) {
      this.searchForm.disable();
      return;
    }
    this.searchForm.enable();
  });

  public searchForm = new FormBuilder().nonNullable.control('');

  private formatInput = this.searchForm.valueChanges
    .pipe(takeUntilDestroyed())
    .subscribe(value => {
      value = value.replace(/ /g, '');
      if (value.length > 7) {
        value = value.substring(0, 7);
      }
      let finalValue = '';

      for (let i = 0; i < value.length; i++) {
        if (i === 1 || i === 3 || i === 5) {
          finalValue += ' ';
        }
        finalValue += value[i];
      }
      this.searchForm.setValue(finalValue, { emitEvent: false });
    });
  public search = output<string>();

  public handleSearch() {
    this.search.emit(this.removeWhitespace(this.searchForm.value ?? ''));
  }

  private removeWhitespace(value: string): string {
    return value.replace(/ /g, '');
  }

  public reset() {
    this.searchForm.setValue('');
  }
}
