import { CommonModule } from '@angular/common';
import { Component, effect, input, output } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

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

  public searchForm = new FormBuilder().nonNullable.control(
    '',
    Validators.pattern(/^\d{7}$/)
  );
  public search = output<string>();

  public handleSearch() {
    this.search.emit(this.searchForm.value ?? '');
  }

  public reset() {
    this.searchForm.setValue('');
  }
}
