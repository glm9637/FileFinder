import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import { ConfigState } from './config.state';
import { SetAppMode } from './config.actions';
import { ApplicationMode } from './config.enums';

describe('Config store', () => {
  let store: Store;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([ConfigState])],
    });

    store = TestBed.inject(Store);
  });

  it('should set the appropiate mode', () => {
    const expected = ApplicationMode.Scanner;
    store.dispatch(new SetAppMode(ApplicationMode.Scanner));
    const actual = store.selectSnapshot(ConfigState.getAppMode);
    expect(actual).toEqual(expected);
  });
});
