import {
  Component,
  computed,
  inject,
  input,
  SecurityContext,
} from '@angular/core';
import { FileSystem } from '../../../api/models/file-system';
import { DomSanitizer } from '@angular/platform-browser';
export interface ArticleFile {
  article: string;
  file: FileSystem;
}
@Component({
  selector: 'app-file',
  imports: [],
  templateUrl: './file.component.html',
  styleUrl: './file.component.scss',
})
export class FileComponent {
  private readonly sanitizer = inject(DomSanitizer);
  public readonly fileUrl = input<URL | null>();
  protected readonly url = computed(() => {
    const url = this.fileUrl();
    if (url == null) {
      return '';
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url.href);
  });
}
