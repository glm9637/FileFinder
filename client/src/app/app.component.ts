import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApplicationMode, ConfigService } from './core/config.service';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  public modeClass$ = inject(ConfigService).applicationMode$.pipe(
    map(x => (x == ApplicationMode.Scanner ? 'scanner' : ''))
  );
}
