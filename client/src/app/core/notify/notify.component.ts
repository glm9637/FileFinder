import { Component, effect, inject, signal } from '@angular/core';
import { NotifyService } from './notify.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notify',
  imports: [CommonModule],
  templateUrl: './notify.component.html',
  styleUrl: './notify.component.scss',
})
export class NotifyComponent {
  protected notification = inject(NotifyService).notifications;
  protected display = signal(false);
  protected hideEffect = effect(() => {
    const notification = this.notification();
    if (notification == null) {
      return;
    }
    this.display.set(true);
    window.setTimeout(() => {
      this.display.set(false);
    }, 4500);
  });
}
