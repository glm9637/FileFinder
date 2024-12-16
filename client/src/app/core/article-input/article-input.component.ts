import { CommonModule } from '@angular/common';
import { Component, output } from '@angular/core';
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
