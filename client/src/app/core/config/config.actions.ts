import { ApplicationMode } from './config.enums';

export class SetAppMode {
  static readonly type = '[Config] SetAppMode';
  constructor(readonly payload: ApplicationMode) {}
}

export class ToggleAppMode {
  static readonly type = '[Config] ToggleAppMode';
}

export class WatchDisplaySize {
  static readonly type = '[Config] WatchDisplayMode';
}
