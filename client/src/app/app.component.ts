import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScannerService } from './core/scanner.service';
import { ApplicationMode, ConfigService } from './core/config.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  public modeClass$ = inject(ConfigService).applicationMode$.pipe(
    map((x) => (x == ApplicationMode.Scanner ? 'scanner' : ''))
  );
}
