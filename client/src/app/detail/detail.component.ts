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
  SetNumber,
} from '../state/article/article.actions';
import { FullBom } from '../api/models';
import { Router } from '@angular/router';
import { ApiService } from '../api/services';

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
  private showContentOnMobile = signal(false);
  protected showContent = computed(() => {
    if (!this.mobileMode()) {
      return true;
    }
    return this.showContentOnMobile();
  });
  private apiService = inject(ApiService);
  private store = inject(Store);
  protected scannerMode = this.store.selectSignal(ConfigState.isScannerMode);
  protected mobileMode = this.store.selectSignal(ConfigState.isMobileMode);
  protected article = this.store.selectSignal(ArticleState.getArticle);
  protected articleNumber = this.store.selectSignal(ArticleState.getNumber);
  protected articleNumberNotFound = this.store.selectSignal(
    ArticleState.getArticleNotFound
  );
  protected bom = this.store.selectSignal(ArticleState.getBom);
  protected Tab = Tab;
  protected currentTab = signal(Tab.Bom);
  protected currentFile = this.store.selectSignal(ArticleState.getCurrentFile);

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
  }

  protected setTab(tab: Tab): void {
    this.currentTab.set(tab);
  }

  protected fileSelected(file: FileSystem) {
    console.log('hfileier');
    this.store.dispatch(
      new LoadFile({ file: file, article: this.article()!.number! })
    );
    this.showContentOnMobile.set(true);
  }

  protected bomSelected(bom: FullBom) {
    console.log('bom');
    this.store.dispatch(new LoadDefaultFile(bom.number!));

    this.showContentOnMobile.set(true);
  }

  protected displayContent() {
    this.showContentOnMobile.set(true);
  }

  protected hideContent() {
    this.showContentOnMobile.set(false);
  }

  protected async uploadFile(event: Event) {
    const element = event.target as HTMLInputElement | null;
    const files = element?.files;
    const articleNumber = this.articleNumber();
    if (files == null || files.length == 0 || articleNumber == null) {
      return;
    }
    const file = files[0];

    this.apiService
      .uploadFile({
        number: articleNumber,
        body: {
          photo: file,
        },
      })
      .subscribe();
  }
}
