import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FileSystem } from '../../../api/models/file-system';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { HttpClient } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
export interface ArticleFile {
  article: string;
  file: FileSystem;
}

export type FileType = 'pdf' | 'image' | 'text' | 'other';
@Component({
  selector: 'app-file',
  imports: [PdfViewerModule, CommonModule],
  templateUrl: './file.component.html',
  styleUrl: './file.component.scss',
})
export class FileComponent {
  public readonly fileUrl = input<URL | null>();
  private readonly fileUrlSet = effect(() => {
    const _ = this.fileUrl(); // eslint-disable-line @typescript-eslint/no-unused-vars
    this.hasError.set(false);
  });
  private http = inject(HttpClient);
  protected readonly fileType = computed(() => {
    const parts = this.fileUrl()?.pathname.split('.');
    if (parts == null || parts?.length === 1) {
      return 'pdf';
    }
    const extension = parts.pop()!;
    if (['pdf'].includes(extension)) {
      return extension;
    }
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return 'image';
    }
    if (['txt'].includes(extension)) {
      return 'text';
    }
    return 'other';
  });
  private fileUrl$ = toObservable(this.fileUrl);

  protected readonly textContent$ = toObservable(this.fileType).pipe(
    filter(type => type === 'text'),
    switchMap(() => this.fileUrl$),
    filter(url => url != null),
    switchMap(url => this.http.get(url.href, { responseType: 'text' }))
  );

  protected readonly zoom = signal(1);
  protected readonly url = computed(() => {
    const url = this.fileUrl();
    if (url == null) {
      return null;
    }
    return url.href;
  });

  public readonly hasError = signal(false);
  public onError() {
    this.hasError.set(true);
  }

  protected zoomIn() {
    this.zoom.update(zoom => zoom + 0.3);
  }

  protected zoomOut() {
    this.zoom.update(zoom => zoom - 0.3);
  }
}
