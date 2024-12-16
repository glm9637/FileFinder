import { Injectable } from '@angular/core';
import { distinctUntilChanged, map, mergeWith, Subject, tap } from 'rxjs';
import { FileSystem } from '../../api/models/file-system';
import { FullBom } from '../../api/models/full-bom';

export interface ArticleFile {
  article: string;
  file: FileSystem;
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private articleSubject = new Subject<FullBom>();
  private fileSubject = new Subject<ArticleFile>();

  public currentFile$ = this.fileSubject.pipe(
    map((file) => {
      if (file == null || file.file.path == null || file.file.name == null) {
        return null;
      }
      const encodedPath = encodeURIComponent(file.file.path);
      const fullPath = `/api/article/${file.article}/file/${encodedPath}`;
      const url = URL.parse(fullPath, window.location.origin);

      return url;
    }),
    mergeWith(
      this.articleSubject.pipe(
        map((article) => {
          const fullPath = `/api/article/${article.number}/file`;
          const url = URL.parse(fullPath, window.location.origin);
          return url;
        })
      )
    ),
    distinctUntilChanged((a, b) => a?.toString() == b?.toString())
  );

  public setArticle(article: FullBom) {
    this.articleSubject.next(article);
  }

  public setFile(file: ArticleFile) {
    console.log('set article ' + file.article);
    this.fileSubject.next(file);
  }
}
