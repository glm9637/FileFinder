import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DetailComponent } from './detail/detail.component';
import { numberResolver } from './detail/resolver/number.resolver';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: ':number',
    component: DetailComponent,
    resolve: {
      number: numberResolver,
    },
  },
];
