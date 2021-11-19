import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationStore } from 'src/app/sharedServices/models';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-file-selection-dialog',
  templateUrl: 'fileSelectionDialog.component.html',
  styleUrls: ['fileSelectionDialog.component.scss']
})

export class FileSelectionDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<FileSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private store: Store<{ application: ApplicationStore }>,
  ) { }
  onSubmitReason = new EventEmitter();
  public isHelpDisplayed = false;

  public toggleHelp() {
    this.isHelpDisplayed = !this.isHelpDisplayed;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public refreshAction(): void {
    this.onSubmitReason.emit('refresh');
    this.dialogRef.close();
  }

  ngOnInit() { }
}
