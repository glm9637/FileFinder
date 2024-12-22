import { inject, Injectable } from '@angular/core';
import {
  State,
  Action,
  Selector,
  StateContext,
  Actions,
  ofActionSuccessful,
} from '@ngxs/store';
import {
  ConnectRouter,
  ConnectScanner,
  LoadBom,
  LoadDefaultFile,
  LoadFile,
  LoadFiles,
  SetNumber,
} from './article.actions';
import { ScannerService } from '../../core/scanner/scanner.service';
import { catchError, map, of, tap } from 'rxjs';
import { Navigate, RouterDataResolved } from '@ngxs/router-plugin';
import { RouterStateSnapshot } from '@angular/router';
import { ApiService } from '../../api/services';
import { Article, FullBom } from '../../api/models';

export interface ArticleStateModel {
  number: string | null;
  bom: FullBom | null;
  article: Article | null;
  currentFile: URL | null;
  numberNotFound: boolean;
}

@State<ArticleStateModel>({
  name: 'article',
  defaults: {
    number: null,
    bom: null,
    article: null,
    currentFile: null,
    numberNotFound: true,
  },
})
@Injectable()
export class ArticleState {
  private readonly apiService = inject(ApiService);
  @Selector()
  static getNumber(state: ArticleStateModel) {
    return state.number;
  }

  @Selector()
  static getBom(state: ArticleStateModel) {
    return state.bom;
  }

  @Selector()
  static getArticle(state: ArticleStateModel) {
    return state.article;
  }

  @Selector()
  static getCurrentFile(state: ArticleStateModel) {
    return state.currentFile;
  }

  @Selector()
  static getArticleNotFound(state: ArticleStateModel) {
    return state.numberNotFound;
  }

  private setArticleNumber(
    ctx: StateContext<ArticleStateModel>,
    article: string
  ) {
    ctx.dispatch(new Navigate([`/${article}`]));
    ctx.patchState({ number: article });
  }

  @Action(ConnectRouter)
  connectRouter(ctx: StateContext<ArticleStateModel>) {
    return inject(Actions).pipe(
      ofActionSuccessful(RouterDataResolved<RouterStateSnapshot>),
      map((action: RouterDataResolved<RouterStateSnapshot>) => {
        const articleNumber =
          action.routerState.root.firstChild?.params['number'];
        ctx.patchState({ number: articleNumber });
        if (articleNumber == null) {
          return;
        }
        ctx.dispatch([new LoadBom(), new LoadFiles()]);
      })
    );
  }

  @Action(ConnectScanner)
  connectScanner(ctx: StateContext<ArticleStateModel>) {
    return inject(ScannerService).article$.pipe(
      tap(article => {
        this.setArticleNumber(ctx, article);
      })
    );
  }

  @Action(SetNumber)
  setNumber(ctx: StateContext<ArticleStateModel>, { number }: SetNumber) {
    this.setArticleNumber(ctx, number);
  }

  @Action(LoadBom)
  loadBom(ctx: StateContext<ArticleStateModel>) {
    const number = ctx.getState().number;
    if (number == null) {
      return;
    }
    return this.apiService.getFullBom({ number }).pipe(
      tap(x => {
        ctx.patchState({ bom: x });
      })
    );
  }

  @Action(LoadFiles)
  loadFiles(ctx: StateContext<ArticleStateModel>) {
    const number = ctx.getState().number;
    if (number == null) {
      return;
    }
    return this.apiService.getArticle({ number }).pipe(
      tap(x => {
        ctx.patchState({ article: x, numberNotFound: false });
      }),
      catchError(() => {
        ctx.patchState({ numberNotFound: true });
        return of(null);
      })
    );
  }

  @Action(LoadFile)
  loadFile(ctx: StateContext<ArticleStateModel>, { payload }: LoadFile) {
    const { file, article } = payload;
    if (file == null || file.path == null || file.name == null) {
      return;
    }
    const encodedPath = encodeURIComponent(file.path);
    const fullPath = `/api/article/${article}/file/${encodedPath}`;
    const url = URL.parse(fullPath, window.location.origin);
    ctx.patchState({ currentFile: url });
  }

  @Action(LoadDefaultFile)
  loadDefaultFile(
    ctx: StateContext<ArticleStateModel>,
    { articleNumber }: LoadDefaultFile
  ) {
    const fullPath = `/api/article/${articleNumber}/file`;
    const url = URL.parse(fullPath, window.location.origin);
    ctx.patchState({ currentFile: url });
  }
}
