import { inject, Injectable } from '@angular/core';
import { State, Action, Selector, StateContext } from '@ngxs/store';
import { SetAppMode, ToggleAppMode, WatchDisplaySize } from './config.actions';
import { BreakpointObserver } from '@angular/cdk/layout';
import { tap } from 'rxjs';
import { ApplicationMode } from './config.enums';
import { ScannerService } from '../scanner/scanner.service';

export interface ConfigStateModel {
  mode: ApplicationMode;
}

const PREV_MODE_KEY = 'Config:PrevApplicationMode';
const MODE_KEY = 'Config:ApplicationMode';

@State<ConfigStateModel>({
  name: 'config',
  defaults: {
    mode:
      (window.localStorage.getItem(MODE_KEY) as ApplicationMode | null) ??
      ApplicationMode.Keyboard,
  },
})
@Injectable()
export class ConfigState {
  private scannerService = inject(ScannerService);
  private setMode(ctx: StateContext<ConfigStateModel>, mode: ApplicationMode) {
    window.localStorage.setItem(PREV_MODE_KEY, ctx.getState().mode);
    window.localStorage.setItem(MODE_KEY, mode);
    if (mode === ApplicationMode.Scanner) {
      this.scannerService.enableScanner();
    } else {
      this.scannerService.disableScanner();
    }
    ctx.patchState({ mode: mode });
  }

  @Action(SetAppMode)
  setAppMode(ctx: StateContext<ConfigStateModel>, { payload }: SetAppMode) {
    this.setMode(ctx, payload);
  }

  @Action(WatchDisplaySize)
  watchAppMode(ctx: StateContext<ConfigStateModel>) {
    return inject(BreakpointObserver)
      .observe('(max-width: 700px)')
      .pipe(
        tap(breakpoint => {
          const state = ctx.getState();
          if (breakpoint.matches && state.mode !== ApplicationMode.Mobile) {
            this.setMode(ctx, ApplicationMode.Mobile);
            return;
          }
          if (
            breakpoint.matches ||
            (window.localStorage.getItem(
              MODE_KEY
            ) as ApplicationMode | null) !== ApplicationMode.Mobile
          ) {
            return;
          }

          this.setMode(
            ctx,
            (window.localStorage.getItem(
              PREV_MODE_KEY
            ) as ApplicationMode | null) ?? ApplicationMode.Keyboard
          );
        })
      );
  }

  @Action(ToggleAppMode)
  toggleAppMode(ctx: StateContext<ConfigStateModel>) {
    const current = ctx.getState().mode;
    if (current == ApplicationMode.Scanner) {
      this.setMode(ctx, ApplicationMode.Keyboard);
    } else if (current == ApplicationMode.Keyboard) {
      this.setMode(ctx, ApplicationMode.Scanner);
    }
  }

  @Selector()
  static getAppMode(state: ConfigStateModel) {
    return state.mode;
  }

  @Selector()
  static isScannerMode(state: ConfigStateModel) {
    return state.mode == ApplicationMode.Scanner;
  }

  @Selector()
  static isMobileMode(state: ConfigStateModel) {
    return state.mode == ApplicationMode.Mobile;
  }
}
