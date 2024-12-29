import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfigState } from './core/config/config.state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly store = inject(Store);

  public modeClass = this.store.selectSignal(ConfigState.getAppMode);
}
