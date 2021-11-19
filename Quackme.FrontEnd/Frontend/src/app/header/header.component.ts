import { Component, OnInit } from '@angular/core';
import { AuthService } from '../sharedServices/auth.service';
import { ActionsSubject } from '@ngrx/store';
import { ActionTypes } from '../reducers/actions';
import { StationDataState } from '../sharedServices/models';

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.scss']
})

export class HeaderComponent implements OnInit {
  public isEUSelected = true;

  constructor(
    public authService: AuthService,
    private actionsSubj: ActionsSubject,
  ) { }

  public logout() {
    this.authService.logout();
  }


  ngOnInit() {
    this.actionsSubj.
      subscribe((state: StationDataState) => {
        if (state.type === ActionTypes.FlyToEurope) {
          this.isEUSelected = true;
        }
        if (state.type === ActionTypes.FlyToChina) {
          this.isEUSelected = false;
        }
      });
  }

}
