import {
  Component,
  computed,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { FileSystem } from '../../../api/models/file-system';
import { TreeComponent, TreeItem } from '../../../core/tree/tree.component';
import { Bom } from '../../../api/models/bom';

@Component({
  selector: 'app-files',
  imports: [TreeComponent],
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss',
})
export class FilesComponent {
  @ViewChild(TreeComponent) tree: TreeComponent<Bom> | undefined;
  public files = input<FileSystem[]>();
  readonly selectFirst = input<boolean>(true);

  public fileSelected = output<FileSystem>();
  public initialSelection = signal<FileSystem | null>(null);

  protected treeData = computed(() => {
    const current = this.files();
    if (current) {
      return current.map(c => this.mapToTreeItem(c));
    }
    return [];
  });

  public selectNext() {
    this.tree?.selectNext();
  }

  public selectPrevious() {
    this.tree?.selectPrevious();
  }

  private mapToTreeItem(
    item: FileSystem,
    expanded = true,
    preSelect = false
  ): TreeItem<FileSystem> {
    return {
      label: `${item.name ?? ''}`,
      item: item,
      expanded,
      initialSelection: preSelect && item.name?.includes('pdf'),
      children:
        item.children
          ?.map(c =>
            this.mapToTreeItem(
              c,
              true,
              item.name === 'PDU' && c.name?.includes('pdf')
            )
          )
          .filter(x => x != null) ?? null,
    };
  }

  protected treeItemSelected(item: FileSystem) {
    this.fileSelected.emit(item);
  }
}
