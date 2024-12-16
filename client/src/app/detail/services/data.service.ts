import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../api/services';
import { BehaviorSubject, filter, mergeMap, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private numberSubject = new BehaviorSubject<string | null>(null);
  private readonly apiService = inject(ApiService);

  public files$ = this.numberSubject.pipe(
    filter((number) => number != null),
    mergeMap((number) => this.apiService.getArticle({ number })),
    shareReplay(1)
  );

  public fulllBom$ = this.numberSubject.pipe(
    filter((number) => number != null),
    mergeMap((number) => this.apiService.getFullBom({ number })),
    shareReplay(1)
  );

  constructor() {}

  public setNumber(number: string): void {
    this.numberSubject.next(number);
  }
}
