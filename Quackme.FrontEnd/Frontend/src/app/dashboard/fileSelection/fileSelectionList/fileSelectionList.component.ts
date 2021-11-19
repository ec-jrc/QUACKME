import { Component, Input, ViewChild, EventEmitter, ChangeDetectionStrategy, OnChanges, Output } from '@angular/core';
import { Observation } from '../../../sharedServices/models';

@Component({
  selector: 'app-file-list',
  templateUrl: 'fileSelectionList.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['fileSelectionList.component.scss'],

})

export class FileSelectionListComponent {

  constructor(

  ) { }

  @Input() dataSource;
  @Input() displayedColumns;
  @Input() selection;
  @Input() selectedFile;
  @Output() emittChangeSelectedFile: EventEmitter<Observation> = new EventEmitter();


  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public checkboxLabel(row): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  public changeSelectedFile($event) {
    this.emittChangeSelectedFile.emit($event);
  }

}
