import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
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
  public readonly fileCount = input<number>(0);
  public readonly fileIndex = input<number>(0);
  protected readonly fileDots = computed(() => {
    const fileCount = this.fileCount();
    const fileIndex = this.fileIndex();
    if (fileCount < 2) {
      return [];
    }
    const result = new Array(fileCount).fill(false);
    result[fileIndex] = true;
    return result;
  });
  protected readonly hasNextFile = computed(() => {
    return this.fileCount() > 1;
  });
  public readonly nextFile = output<void>();
  private printFrame: HTMLIFrameElement | null = null;
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

  protected readonly zoom = signal(1.1);
  protected readonly url = computed(() => {
    const url = this.fileUrl();
    if (url == null) {
      return null;
    }
    return url.href;
  });

  public readonly hasError = signal(false);
  public onError(event: unknown) {
    console.error(event);
    this.hasError.set(true);
  }

  protected zoomIn() {
    this.zoom.update(zoom => zoom + 0.05);
  }

  protected zoomOut() {
    this.zoom.update(zoom => zoom - 0.05);
  }

  protected print() {
    const url = this.url();
    if (url == null) {
      return;
    }
    if (this.printFrame == null) {
      this.printFrame = document.createElement('iframe');
      this.printFrame.style.position = 'absolute';
      this.printFrame.style.top = '-1000';
    }

    this.printFrame.src = url;
    this.printFrame = document.body.appendChild(this.printFrame);
    window.setTimeout(() => {
      this.printFrame?.contentWindow?.print();
      window.setTimeout(() => {
        document.body.removeChild(this.printFrame!);
      }, 500);
    }, 200);
  }

  protected next() {
    if (!this.hasNextFile()) {
      return;
    }
    this.nextFile.emit();
  }
}
