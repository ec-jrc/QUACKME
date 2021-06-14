import { Component, OnInit, Inject, EventEmitter, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationStore } from 'src/app/sharedServices/models';
import { Store } from '@ngrx/store';

const labes = {
  EUR: 'European',
  CHN: 'China'
};
@Component({
  selector: 'app-file-selection-dialog',
  templateUrl: 'confirmationDialog.component.html',
  styleUrls: ['confirmationDialog.component.scss']
})

export class ConfirmationDialogComponent implements OnInit {
  public selectedValue = labes['EUR'];
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
    this.selectedValue = labes[data];

  }
  onSubmitReason = new EventEmitter();

  onNoClick(): void {
    this.dialogRef.close();
  }

  public refreshAction(): void {
    this.onSubmitReason.emit('send');
    this.dialogRef.close();
  }

  ngOnInit() { }
}
