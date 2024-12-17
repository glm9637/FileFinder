import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { ConfigState } from '../config/config.state';
import { ApplicationMode } from '../config/config.enums';
import { ToggleAppMode } from '../config/config.actions';

@Component({
  selector: 'app-mode-toggle',
  imports: [CommonModule],
  templateUrl: './mode-toggle.component.html',
  styleUrl: './mode-toggle.component.scss',
})
export class ModeToggleComponent {
  private store = inject(Store);
  public appMode = this.store.selectSignal(ConfigState.getAppMode);
  public AppMode = ApplicationMode;
  public toggleMode() {
    this.store.dispatch(ToggleAppMode);
  }
}
