import { CommonModule } from '@angular/common';
import { Component, effect, input, output, signal } from '@angular/core';

export enum Tab {
  Bom,
  Folder,
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  public Selection = Tab;
  protected selection = signal(Tab.Bom);
  public selectionChanged = output<Tab>();
  private selectionChangedEffect = effect(() => {
    this.selectionChanged.emit(this.selection());
  });
  public enableBom = input.required<boolean>();
  private enabelBomChanged = effect(() => {
    if (!this.enableBom()) {
      this.selection.set(Tab.Folder);
    }
  });

  public setBom() {
    if (this.enableBom()) {
      this.selection.set(Tab.Bom);
    }
  }

  public setFolder() {
    this.selection.set(Tab.Folder);
  }
}
