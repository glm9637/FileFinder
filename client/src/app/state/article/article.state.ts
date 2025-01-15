import { inject, Injectable } from '@angular/core';
import {
  State,
  Action,
  Selector,
  StateContext,
  Actions,
  ofActionSuccessful,
  NgxsOnInit,
} from '@ngxs/store';
import {
  ConnectRouter,
  ConnectScanner,
  LoadBom,
  LoadDefaultFile,
  LoadFile,
  LoadFiles,
  LoadNextFile,
  SetNumber,
  SetPageTitle,
} from './article.actions';
import { ScannerService } from '../../core/scanner/scanner.service';
import { catchError, map, of, tap } from 'rxjs';
import { Navigate, RouterDataResolved } from '@ngxs/router-plugin';
import { RouterStateSnapshot } from '@angular/router';
import { ApiService } from '../../api/services';
import { Bom } from '../../api/models/bom';
import { Article } from '../../api/models/article';

export interface ArticleStateModel {
  number: string | null;
  bom: Bom | null;
  bomLoading: boolean;
  article: Article | null;
  currentFile: URL | null;
  numberNotFound: boolean;
  bomArticle?: Article;
  bomFileIndex?: number;
}

@State<ArticleStateModel>({
  name: 'article',
  defaults: {
    number: null,
    bom: null,
    article: null,
    currentFile: null,
    numberNotFound: true,
    bomLoading: false,
  },
})
@Injectable()
export class ArticleState implements NgxsOnInit {
  private readonly apiService = inject(ApiService);

  ngxsOnInit(ctx: StateContext<ArticleStateModel>): void {
    ctx.dispatch([new ConnectRouter(), new ConnectScanner()]);
  }
  @Selector()
  static getNumber(state: ArticleStateModel) {
    return state.number;
  }

  @Selector()
  static getBom(state: ArticleStateModel) {
    return state.bom;
  }

  @Selector()
  static getBomLoading(state: ArticleStateModel) {
    return state.bomLoading;
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

  @Selector()
  static getBomFileCount(state: ArticleStateModel) {
    return state.bomArticle?.files?.length ?? 0;
  }

  @Selector()
  static getBomFileIndex(state: ArticleStateModel) {
    return state.bomFileIndex ?? 0;
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
        ctx.dispatch([new LoadBom(), new LoadFiles(), new SetPageTitle()]);
      })
    );
  }

  @Action(SetPageTitle)
  setPageTitle(ctx: StateContext<ArticleStateModel>) {
    let current = document.title;
    if (current.includes('-')) {
      current = current.split('-')[0].trimEnd();
    }
    const number = ctx.getState().number;
    if (number != null) {
      current = `${current} - ${number}`;
    }
    document.title = current;
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
    if (number.length !== 7) {
      throw new Error('Invalid article number');
    }
    this.setArticleNumber(ctx, number);
  }

  @Action(LoadBom)
  loadBom(ctx: StateContext<ArticleStateModel>) {
    ctx.patchState({ bomLoading: true });
    const number = ctx.getState().number;
    if (number == null) {
      return;
    }
    return this.apiService.getBom({ number }).pipe(
      tap(x => {
        ctx.patchState({ bom: x, bomLoading: false });
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
    return this.apiService.getArticleFiles({ number: articleNumber }).pipe(
      tap(x => {
        ctx.patchState({
          bomArticle: x,
          numberNotFound: false,
          bomFileIndex: 0,
        });
        if (x.files && x.files.length > 0) {
          ctx.dispatch(
            new LoadFile({ file: x.files[0], article: articleNumber })
          );
        }
      }),
      catchError(() => {
        ctx.patchState({ numberNotFound: true, bomFileIndex: undefined });
        return of(null);
      })
    );
  }

  @Action(LoadNextFile)
  loadNextFile(ctx: StateContext<ArticleStateModel>) {
    const state = ctx.getState();
    if (
      state.bomArticle == null ||
      state.bomArticle.files == null ||
      state.bomArticle.files.length === 0
    ) {
      return;
    }
    const index = state.bomFileIndex ?? -1;
    const nextIndex = (index + 1) % state.bomArticle.files.length;
    ctx.patchState({ bomFileIndex: nextIndex });
    ctx.dispatch(
      new LoadFile({
        file: state.bomArticle.files![nextIndex],
        article: state.bomArticle.number!,
      })
    );
  }
}
