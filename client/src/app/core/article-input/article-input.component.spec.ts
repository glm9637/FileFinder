import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleInputComponent } from './article-input.component';

describe('ArticleInputComponent', () => {
  let component: ArticleInputComponent;
  let fixture: ComponentFixture<ArticleInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
