import { inject } from '@angular/core';
import { NavigationEnd, NavigationError, ResolveFn } from '@angular/router';
import { DataService } from '../services/data.service';

export const numberResolver: ResolveFn<boolean> = (route, state) => {
  const dataService = inject(DataService);
  if (!route.paramMap.has('number')) {
    throw new Error('No route number was passed');
  }
  const number = route.paramMap.get('number')!;

  dataService.setNumber(number);

  return true;
};
