import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Bom } from '../../../api/models/bom';
import { TreeComponent, TreeItem } from '../../../core/tree/tree.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-bom',
  imports: [CommonModule, TreeComponent, ReactiveFormsModule],
  templateUrl: './bom.component.html',
  styleUrl: './bom.component.scss',
})
export class BomComponent {
  public bom = input<Bom | null>();
  readonly selectFirst = input<boolean>(true);
  public bomLoading = input.required<boolean>();

  public bomSelected = output<Bom>();
  protected filter = new FormBuilder().nonNullable.control('');
  private filterValue = toSignal(this.filter.valueChanges);
  protected treeData = computed(() => {
    const current = this.bom();
    if (current) {
      return [this.mapToTreeItem(current, true)];
    }
    return [];
  });

  protected filteredTreeData = computed(() => {
    const full = this.treeData();
    let filter = this.filterValue()?.toLowerCase();
    if (filter == null || filter == '') {
      filter = '';
    }

    const result = [
      ...full.map(item => {
        item.display = this.filterTreeItem(item, filter);
        return item;
      }),
    ];
    return result;
  });

  private filterTreeItem(item: TreeItem<Bom>, search: string): boolean {
    let result = false;
    const filterItem = item.item;
    if (
      search == '' ||
      filterItem.name?.toLowerCase().includes(search) ||
      filterItem.number?.toLowerCase().includes(search)
    ) {
      result = true;
    }
    if (item.children == null) {
      return result;
    }
    item.children.forEach(item => {
      item.display = this.filterTreeItem(item, search);
      result = result || item.display;
    });
    return result;
  }

  private mapToTreeItem(item: Bom, expanded = false): TreeItem<Bom> {
    return {
      label: `[${item.index}] ${item.number} ${item.name ?? ''}`,
      item: item,
      expanded,
      children:
        item.children?.map(c => this.mapToTreeItem(c)).filter(x => x != null) ??
        null,
    };
  }

  protected itemSelected(item: Bom) {
    this.bomSelected.emit(item);
  }
}
