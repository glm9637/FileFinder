import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum ScannerCommand {
  Next = 'NEXT',
  Previous = 'PREV',
  Article = '',
  Back = 'CLOSE',
}

@Injectable({
  providedIn: 'root',
})
export class ScannerService {
  private readonly SCANNER_END_SYMBOL = 'Enter';
  private currentInput = '';
  private eventSubject = new Subject<{
    command: Exclude<ScannerCommand, ScannerCommand.Article>;
    date: Date;
  }>();
  private articleSubject = new Subject<string>();
  private errorSubject = new Subject<void>();
  public event$ = this.eventSubject.asObservable();
  public article$ = this.articleSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  private handleInput = (event: KeyboardEvent) => {
    if (event.key == this.SCANNER_END_SYMBOL) {
      this.processInput(this.currentInput);

      this.currentInput = '';
    }
    if (/^[0-9a-zA-z]$/.test(event.key)) {
      this.currentInput += event.key;
      if (this.currentInput.length > 7) {
        this.currentInput = this.currentInput.substring(1);
      }
    }
  };

  public enableScanner() {
    this.currentInput = '';
    window.addEventListener('keydown', this.handleInput);
  }

  public disableScanner() {
    this.currentInput = '';
    window.removeEventListener('keydown', this.handleInput);
  }

  private processInput(input: string) {
    if (input.endsWith(ScannerCommand.Next)) {
      this.sendCommand(ScannerCommand.Next);
      return;
    }
    if (input.endsWith(ScannerCommand.Previous)) {
      this.sendCommand(ScannerCommand.Previous);
      return;
    }
    if (input.endsWith(ScannerCommand.Back)) {
      this.sendCommand(ScannerCommand.Back);
      return;
    }
    if (/^\d{7}$/.test(input)) {
      this.articleSubject.next(this.currentInput);
      return;
    }
    this.errorSubject.next();
  }

  private sendCommand(
    command: Exclude<ScannerCommand, ScannerCommand.Article>
  ) {
    this.eventSubject.next({
      command: command,
      date: new Date(),
    });
  }
}
