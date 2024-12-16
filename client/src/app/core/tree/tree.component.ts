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
  private readonly itemSetEffect = effect(() => {
    console.log('item list set effect');
    if (this.itemList().length == 0) {
      return;
    }
    this.itemClicked(this.itemList()[0]);
  });

  private readonly itemSelectedEffect = effect(() => {
    const item = this.selected();
    if (item == null) {
      return;
    }
    this.itemSelected.emit(item.item);
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
      console.log(nextIndex);
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
      ...items.filter(x => x.children == null),
      ...items.flatMap(i => this.toList(i.children ?? [], includeAllNodes)),
    ];
  }

  protected itemClicked(item: TreeItem<T>): void {
    if (item.children == null || this.outputOnNonNode()) {
      this.selected.set(item);
    }
    if (item.children != null) {
      item.expanded = !item.expanded;
    }
  }
}
