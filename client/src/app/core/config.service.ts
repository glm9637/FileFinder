import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, switchMap, tap } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ScannerService } from './scanner.service';

export enum ApplicationMode {
  Keyboard = 'keyboard',
  Scanner = 'scanner',
  Mobile = 'mobile',
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly MODE_KEY = 'ApplicationMode';
  private scannerService = inject(ScannerService);
  private mode = new BehaviorSubject<ApplicationMode>(
    (window.localStorage.getItem(this.MODE_KEY) as ApplicationMode | null) ??
      ApplicationMode.Keyboard
  );

  private breakpointObserver = inject(BreakpointObserver);
  private isMobile$ = this.breakpointObserver
    .observe(Breakpoints.Small)
    .pipe(map((x) => x.matches));

  public applicationMode$ = this.mode.pipe(
    tap((mode) => {
      window.localStorage.setItem(this.MODE_KEY, mode);
      if (mode == ApplicationMode.Scanner) {
        this.scannerService.enableScanner();
      } else {
        this.scannerService.disableScanner();
      }
    }),
    switchMap((mode) =>
      this.isMobile$.pipe(
        map((isMobile) => (isMobile ? ApplicationMode.Mobile : mode))
      )
    )
  );
  constructor() {}
  public setMode(mode: ApplicationMode.Keyboard | ApplicationMode.Scanner) {
    this.mode.next(mode);
  }
}
