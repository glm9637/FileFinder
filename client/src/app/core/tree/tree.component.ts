import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';

export interface TreeItem<T> {
  label: string;
  item: T;
  children: TreeItem<T>[] | null;
  expanded: boolean;
  display?: boolean;
}

@Component({
  selector: 'app-tree',
  imports: [CommonModule],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeComponent<T> {
  readonly items = input.required<TreeItem<T>[]>();
  readonly itemList = computed(() => {
    return this.toList(this.items(), this.outputOnNonNode());
  });
  readonly itemSelected = output<T>();
  readonly selected = signal<TreeItem<T> | null>(null);
  readonly outputOnNonNode = input<boolean>(false);
  readonly selectFirst = input<boolean>(true);
  private readonly itemSetEffect = effect(() => {
    const itemList = this.itemList();
    if (itemList.length == 0) {
      return;
    }
    if (this.selectFirst()) {
      this.itemClicked(itemList[0]);
    }
    itemList[0].expanded = true;
  });

  public selectNext() {
    const list = this.itemList();
    this.selected.update(item => {
      if (item == null) {
        if (list.length == 0) {
          return item;
        }
        item = list[0];
      }
      let nextIndex = list.indexOf(item) + 1;
      if (nextIndex >= list.length) {
        nextIndex = 0;
      }
      const selection = list[nextIndex];
      this.itemSelected.emit(selection.item);
      return selection;
    });
  }

  public selectPrevious() {
    const list = this.itemList();
    this.selected.update(item => {
      if (item == null) {
        if (list.length == 0) {
          return item;
        }
        item = list[0];
      }
      let nextIndex = list.indexOf(item) - 1;
      if (nextIndex < 0) {
        nextIndex = list.length - 1;
      }
      const selection = list[nextIndex];
      this.itemSelected.emit(selection.item);
      return selection;
    });
  }

  private toList(
    items: TreeItem<T>[],
    includeAllNodes: boolean
  ): TreeItem<T>[] {
    if (items.length == 0) {
      return [];
    }
    return [
      ...(includeAllNodes ? items : items.filter(x => x.children == null)),
      ...items.flatMap(i => this.toList(i.children ?? [], includeAllNodes)),
    ];
  }

  protected itemClicked(item: TreeItem<T>): void {
    if (item.children == null || this.outputOnNonNode()) {
      this.selected.set(item);

      this.itemSelected.emit(item.item);
    }
  }

  protected expandClicked(item: TreeItem<T>): void {
    if (item.children != null) {
      item.expanded = !item.expanded;
    }
  }
}
