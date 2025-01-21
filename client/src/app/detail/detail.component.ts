import {
  Component,
  computed,
  effect,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { BomComponent } from './components/bom/bom.component';
import { FileComponent } from './components/file/file.component';
import { FilesComponent } from './components/files/files.component';
import { SidebarComponent, Tab } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { toSignal } from '@angular/core/rxjs-interop';

import { FileSystem } from '../api/models/file-system';
import {
  ScannerCommand,
  ScannerService,
} from '../core/scanner/scanner.service';
import { Store } from '@ngxs/store';
import { ConfigState } from '../core/config/config.state';
import { ArticleState } from '../state/article/article.state';
import {
  LoadDefaultFile,
  LoadFile,
  LoadFiles,
  LoadNextFile,
  SetNumber,
} from '../state/article/article.actions';
import { Bom } from '../api/models/bom';
import { Router } from '@angular/router';
import { ApiService } from '../api/services';
import { NotifyService } from '../core/notify/notify.service';
import { catchError, of, tap } from 'rxjs';

@Component({
  selector: 'app-detail',
  imports: [
    BomComponent,
    FileComponent,
    FilesComponent,
    SidebarComponent,
    TopbarComponent,
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent {
  @ViewChild(FilesComponent) filesComponent: FilesComponent | undefined;
  private ignoreFileSelected = true;
  private showContentOnMobile = signal(false);
  protected showContent = computed(() => {
    if (!this.mobileMode()) {
      return true;
    }
    return this.showContentOnMobile();
  });

  private notificationService = inject(NotifyService);
  private apiService = inject(ApiService);
  private store = inject(Store);
  protected scannerMode = this.store.selectSignal(ConfigState.isScannerMode);
  protected mobileMode = this.store.selectSignal(ConfigState.isMobileMode);
  protected article = this.store.selectSignal(ArticleState.getArticle);
  protected articleNumber = this.store.selectSignal(ArticleState.getNumber);
  protected defaultFileNotFound = this.store.selectSignal(
    ArticleState.getDefaultFileNotFound
  );
  protected articleNumberNotFound = this.store.selectSignal(
    ArticleState.getArticleNotFound
  );
  protected bomLoading = this.store.selectSignal(ArticleState.getBomLoading);
  protected bom = this.store.selectSignal(ArticleState.getBom);
  protected Tab = Tab;
  protected currentTab = signal(Tab.Folder);
  protected currentFile = this.store.selectSignal(ArticleState.getCurrentFile);

  protected readonly fileCount = this.store.selectSignal(
    ArticleState.getBomFileCount
  );
  protected readonly fileIndex = this.store.selectSignal(
    ArticleState.getBomFileIndex
  );

  private router = inject(Router);
  private readonly scannerCommand = toSignal(inject(ScannerService).event$);
  private readonly scannerCommandEffect = effect(() => {
    const command = this.scannerCommand()?.command;
    if (command == ScannerCommand.Back) {
      this.router.navigate(['..']);
      return;
    }
    if (command == ScannerCommand.Next) {
      this.filesComponent?.selectNext();
      return;
    }
    if (command == ScannerCommand.Previous) {
      this.filesComponent?.selectPrevious();
      return;
    }
  });

  public handleSearch(article: string): void {
    this.store.dispatch(new SetNumber(article));

    this.ignoreFileSelected = true;
  }

  protected setTab(tab: Tab): void {
    this.currentTab.set(tab);
    this.ignoreFileSelected = true;
  }

  protected fileSelected(file: FileSystem) {
    this.store.dispatch(
      new LoadFile({ file: file, article: this.article()!.number! })
    );
    if (this.ignoreFileSelected) {
      this.ignoreFileSelected = false;
      return;
    }
    this.showContentOnMobile.set(true);
  }

  protected bomSelected(bom: Bom) {
    this.store.dispatch(new LoadDefaultFile(bom.number!));

    this.showContentOnMobile.set(true);
  }

  protected displayContent() {
    this.showContentOnMobile.set(true);
  }

  protected hideContent() {
    this.showContentOnMobile.set(false);
  }

  protected nextFile() {
    this.store.dispatch(new LoadNextFile());
  }

  protected async uploadFile(event: Event) {
    const element = event.target as HTMLInputElement | null;
    const files = element?.files;
    const articleNumber = this.articleNumber();
    if (files == null || files.length == 0 || articleNumber == null) {
      return;
    }

    this.apiService
      .uploadFile({
        number: articleNumber,
        body: {
          attachments: Array.from(files),
        },
      })
      .pipe(
        tap(() => {
          this.notificationService.success('Hochladen erfolgreich');
        }),
        catchError(() => {
          this.notificationService.error('Fehler beim Hochladen');
          return of(null);
        })
      )
      .subscribe(() => {
        this.store.dispatch(new LoadFiles());
      });
  }
}
