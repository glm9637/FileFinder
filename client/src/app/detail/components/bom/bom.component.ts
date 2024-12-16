import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { FullBom } from '../../../api/models/full-bom';
import { TreeComponent, TreeItem } from '../../../core/tree/tree.component';
import { Bom } from '../../../api/models/bom';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';

@Component({
  selector: 'app-bom',
  imports: [CommonModule, TreeComponent, ReactiveFormsModule],
  templateUrl: './bom.component.html',
  styleUrl: './bom.component.scss',
})
export class BomComponent {
  public bom = input<FullBom>();
  public bomSelected = output<Bom>();
  protected filter = new FormBuilder().nonNullable.control('');
  private filterValue = toSignal(
    this.filter.valueChanges.pipe(tap((x) => console.log(x)))
  );
  protected treeData = computed(() => {
    let current = this.bom();
    if (current) {
      return [this.mapToTreeItem(current, true)];
    }
    return [];
  });

  protected filteredTreeData = computed(() => {
    let full = this.treeData();
    let filter = this.filterValue()?.toLowerCase();
    if (filter == null || filter == '') {
      filter = '';
    }
    full.forEach((item) => {
      item.display = this.filterTreeItem(item, filter);
    });
    return full;
  });

  private filterTreeItem(item: TreeItem<FullBom>, search: string): boolean {
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
    item.children.forEach((item) => {
      item.display = this.filterTreeItem(item, search);
      result = result || item.display;
    });
    return result;
  }

  private mapToTreeItem(
    item: FullBom,
    expanded: boolean = false
  ): TreeItem<FullBom> {
    return {
      label: `${item.number} ${item.name ?? ''}`,
      item: item,
      expanded,
      children:
        item.children
          ?.map((c) => this.mapToTreeItem(c))
          .filter((x) => x != null) ?? null,
    };
  }

  protected itemSelected(item: Bom) {
    this.bomSelected.emit(item);
  }
}
