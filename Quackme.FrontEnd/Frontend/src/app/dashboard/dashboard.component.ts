import { Component, OnInit } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { ActionTypes } from '../reducers/actions';

import * as _ from 'lodash';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.scss']
})

export class DashboardComponent implements OnInit {
  public isLoading = true;
  constructor(
    private actionsSubj: ActionsSubject,
    private store: Store<{ }>,
  ) {

  }

  public ngOnInit() {
    this.actionsSubj.
      subscribe((state) => {
        if (state.type === ActionTypes.LoadStationSuccess) {
          this.isLoading = false;
        }
        if (state.type === ActionTypes.LoadSelectedFile) {
          this.isLoading = true;
        }

        if (state.type === ActionTypes.LoadSelectedFileSuccess) {
          this.isLoading = false;
        }

      });
  }
}
