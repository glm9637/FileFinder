import { Component, computed, input, output, ViewChild } from '@angular/core';
import { FileSystem } from '../../../api/models/file-system';
import { TreeComponent, TreeItem } from '../../../core/tree/tree.component';
import { FullBom } from '../../../api/models/full-bom';

@Component({
  selector: 'app-files',
  imports: [TreeComponent],
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss',
})
export class FilesComponent {
  @ViewChild(TreeComponent) tree: TreeComponent<FullBom> | undefined;
  public files = input<FileSystem[]>();
  public fileSelected = output<FileSystem>();

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
    expanded = true
  ): TreeItem<FileSystem> {
    return {
      label: `${item.name ?? ''}`,
      item: item,
      expanded,
      children:
        item.children?.map(c => this.mapToTreeItem(c)).filter(x => x != null) ??
        null,
    };
  }

  protected treeItemSelected(item: FileSystem) {
    this.fileSelected.emit(item);
  }
}
