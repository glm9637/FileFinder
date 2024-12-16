import { Component, computed, input } from '@angular/core';
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
  protected readonly url = computed(() => {
    const url = this.fileUrl();
    if (url == null) {
      return null;
    }
    return url.href;
  });
}
