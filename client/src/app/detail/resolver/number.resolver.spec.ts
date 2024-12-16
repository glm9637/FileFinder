import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { numberResolver } from './number.resolver';

describe('numberResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => numberResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
