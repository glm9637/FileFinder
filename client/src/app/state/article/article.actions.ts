import { ArticleFile } from './article.types';

export class ConnectScanner {
  static readonly type = '[Article] ConnectScanner';
}

export class ConnectRouter {
  static readonly type = '[Article] ConnectRouter';
}

export class SetNumber {
  static readonly type = '[Article] SetFile';
  constructor(readonly number: string) {}
}

export class LoadBom {
  static readonly type = '[Article] LoadBom';
}

export class LoadFiles {
  static readonly type = '[Article] LoadFiles';
}

export class LoadFile {
  static readonly type = '[Article] LoadFile';
  constructor(readonly payload: ArticleFile) {}
}

export class LoadDefaultFile {
  static readonly type = '[Article] LoadDefault';
  constructor(readonly articleNumber: string) {}
}
