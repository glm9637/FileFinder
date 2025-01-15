import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, throttleTime } from 'rxjs';

export interface Notification {
  message: string;
  type: 'error' | 'success';
}

@Injectable({
  providedIn: 'root',
})
export class NotifyService {
  private $notifications = new Subject<Notification>();

  public success(notification: string) {
    this.$notifications.next({ message: notification, type: 'success' });
  }

  public error(notification: string) {
    this.$notifications.next({ message: notification, type: 'error' });
  }

  public get notifications() {
    return toSignal(this.$notifications.pipe(throttleTime(5000)));
  }
}
