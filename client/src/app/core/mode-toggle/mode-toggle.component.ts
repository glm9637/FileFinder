import { Component, inject } from '@angular/core';
import { ApplicationMode, ConfigService } from '../config.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mode-toggle',
  imports: [CommonModule],
  templateUrl: './mode-toggle.component.html',
  styleUrl: './mode-toggle.component.scss',
})
export class ModeToggleComponent {
  private configService = inject(ConfigService);
  public appMode$ = this.configService.applicationMode$;
  public AppMode = ApplicationMode;
  public toggleMode(current: ApplicationMode) {
    this.configService.setMode(
      current == ApplicationMode.Keyboard
        ? ApplicationMode.Scanner
        : ApplicationMode.Keyboard
    );
  }
}
