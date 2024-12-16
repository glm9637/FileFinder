import { Component, effect, inject, signal, ViewChild } from '@angular/core';
import { BomComponent } from './components/bom/bom.component';
import { ArticleFile, FileComponent } from './components/file/file.component';
import { FilesComponent } from './components/files/files.component';
import { SidebarComponent, Tab } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { DataService } from './services/data.service';
import { toSignal } from '@angular/core/rxjs-interop';

import { FileSystem } from '../api/models/file-system';
import { FileService } from './services/file.service';
import { Bom } from '../api/models/bom';
import { Router } from '@angular/router';
import { ApplicationMode, ConfigService } from '../core/config.service';
import { map } from 'rxjs';
import { ScannerCommand, ScannerService } from '../core/scanner.service';

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
  private dataService = inject(DataService);
  private fileService = inject(FileService);
  protected scannerMode = toSignal(
    inject(ConfigService).applicationMode$.pipe(
      map((x) => x == ApplicationMode.Scanner)
    )
  );
  protected article = toSignal(this.dataService.files$);
  protected bom = toSignal(this.dataService.fulllBom$);
  protected Tab = Tab;
  protected currentTab = signal(Tab.Bom);
  protected currentFile = toSignal(this.fileService.currentFile$);
  private readonly scannerCommand = toSignal(inject(ScannerService).event$);
  private readonly scannerCommandEffect = effect(() => {
    const command = this.scannerCommand()?.command;
    console.log(command);
    if (command == ScannerCommand.Back) {
      console.log('navigation back');
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
  private readonly articleScanner = toSignal(inject(ScannerService).article$);
  private readonly scannerEffect = effect(() => {
    const article = this.articleScanner();
    console.log(article);
    if (article != null) {
      this.handleSearch(article);
    }
  });
  private readonly router = inject(Router);
  public handleSearch(article: string): void {
    this.router.navigate([article]);
  }

  private articleChanges = effect(() => {
    let article = this.article();
    if (article == null) {
      return;
    }
    this.fileService.setArticle({ number: article.number });
  });
  protected setTab(tab: Tab): void {
    this.currentTab.set(tab);
  }

  protected fileSelected(file: FileSystem) {
    this.fileService.setFile({ file: file, article: this.article()!.number! });
  }

  protected bomSelected(bom: Bom) {
    this.fileService.setArticle(bom);
  }
}
