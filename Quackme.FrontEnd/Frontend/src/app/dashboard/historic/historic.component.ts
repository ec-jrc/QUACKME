import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Store, ActionsSubject } from '@ngrx/store';
import { ActionTypes } from '../../reducers/actions';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RangesFooter } from './ranges-footer/ranges-footer.component';

@Component({
  selector: 'app-historic',
  templateUrl: 'historic.component.html',
  styleUrls: ['historic.component.scss'],

})

export class HistoricComponent implements OnInit {
  public country;

  form: FormGroup;
  rangesFooter = RangesFooter;
  public fileName = '';

  inlineRange;

  private fileContent: string;

  inlineRangeChange($event) {
    this.inlineRange = $event;
  }
  constructor(
    private store: Store<{}>,
    fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    // this.form = new FormGroup({
    //   value: new FormControl({ value: '', Validators.required}),
    //   status: new FormControl({ value: this.checkParameter, disabled: isStatusDisable }),
    // });
    this.form = fb.group({
      country: [this.country, Validators.required],
      file: [null, Validators.required],
      fileName: []
    });
  }

  public changeSelectedCountry($event) {
    this.country = $event.value;
    this.form.patchValue({
      country: this.country
    });
  }

  public onFileInput(event) {
    let fileList: FileList = event.target.files;
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsText(file);

      reader.onload = () => {
        this.form.patchValue({
          file: reader.result
        });

        this.fileName = file.name;
        this.fileContent = reader.result as string;
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };

    }
  }

  public onSubmit(e) {
    this.store.dispatch({ type: ActionTypes.UploadFile, form: {
      fileName: this.fileName,
      fileContent: this.fileContent,
      region: this.country
    } });

  }

  ngOnInit() {
    this.store.dispatch({ type: ActionTypes.StopSpinner });

  }
}
