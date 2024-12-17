import { Component, computed, effect, input, signal } from '@angular/core';
import { FileSystem } from '../../../api/models/file-system';
import { PdfViewerModule } from 'ng2-pdf-viewer';
export interface ArticleFile {
  article: string;
  file: FileSystem;
}
@Component({
  selector: 'app-file',
  imports: [PdfViewerModule],
  templateUrl: './file.component.html',
  styleUrl: './file.component.scss',
})
export class FileComponent {
  public readonly fileUrl = input<URL | null>();
  private readonly fileUrlSet = effect(() => {
    const _ = this.fileUrl(); // eslint-disable-line
    this.hasError.set(false);
  });
  protected readonly url = computed(() => {
    const url = this.fileUrl();
    if (url == null) {
      return null;
    }
    return url.href;
  });
  public readonly hasError = signal(false);
  public onError(err: unknown) {
    console.log(err);
    this.hasError.set(true);
  }
}
