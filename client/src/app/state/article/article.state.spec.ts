import { TestBed } from '@angular/core/testing';
import {  provideStore,  Store } from '@ngxs/store';
import { ArticleState, ArticleStateModel } from './article.state';
import { ArticleAction } from './article.actions';

describe('Article store', () => {
  let store: Store;
  beforeEach(() => {
    TestBed.configureTestingModule({
       providers: [provideStore([ArticleState])]
      
    });

    store = TestBed.inject(Store);
  });

  it('should create an action and add an item', () => {
    const expected: ArticleStateModel = {
      items: ['item-1']
    };
    store.dispatch(new ArticleAction('item-1'));
    const actual = store.selectSnapshot(ArticleState.getState);
    expect(actual).toEqual(expected);
  });

});
