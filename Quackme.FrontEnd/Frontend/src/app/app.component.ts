import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { ActionsSubject } from '@ngrx/store';
import { ActionTypes } from './reducers/actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StatusState } from './sharedServices/models';
import { AuthService } from './sharedServices/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  public isLoading = true;
  title = 'MARS - QUACKME';
  private serverError = 'There was a problem with the server. Please contact the administrator.';
  private errorLoad = 'There was a problem with load of the selected file. Please contact the administrator.';
  private errorOverload = 'Sever is bussy, too many requests.';

  private timestampofError = (new Date()).getTime();

  constructor(
    private actionsSubj: ActionsSubject,
    private snackBar: MatSnackBar,
    private changeDetector: ChangeDetectorRef,
    public authService: AuthService
  ) {

  }

  public displayMessage(message) {
    this.snackBar.open(message, 'Ok', {
      duration: 5000,
    });
  }

  @HostListener('window:focus', ['$event'])
  onFocus(): void {
    this.authService.isUserLoggedIn();
  }

  public ngOnInit() {
    this.actionsSubj.
      subscribe((state) => {
        switch (state.type) {
          case ActionTypes.LoadStationSuccess:
            this.isLoading = false;
            break;

          case ActionTypes.LoadSelectedFile:
            this.isLoading = true;
            break;

          case ActionTypes.LoadSelectedFileSuccess:
            this.isLoading = false;
            break;

          case ActionTypes.StopSpinner:
            this.isLoading = false;
            this.changeDetector.detectChanges();
            break;

          case ActionTypes.StartSpinner:
            this.isLoading = false;
            break;

          case ActionTypes.UpdateStationDataFail:
            const messageUpadate = 'There was a problem with update station. Please contact the administrator.';
            this.displayMessage(messageUpadate);
            break;

          case ActionTypes.SendAcceptedFileFail:
            const messageSend = 'There was a problem with sending data. Please contact the administrator.';
            this.displayMessage(messageSend);
            break;

          case ActionTypes.GetFlowsIdsFail:
            this.displayMessage(this.serverError+"1");
            break;

          case ActionTypes.GetServerStatusError:
            const currentTimestampofError = (new Date()).getTime();
            const timeoffset = 6 * 1000;
            if (currentTimestampofError > this.timestampofError + timeoffset) {
              this.timestampofError = currentTimestampofError;
              if ((state as StatusState).payload.status === 503) {
                this.displayMessage(this.errorOverload);
              } else {
                this.displayMessage(this.serverError);
              }
            }
            break;

          case ActionTypes.LoadSelectedFileFail:
            this.displayMessage(this.errorLoad);
            break;

          case ActionTypes.LoadSelectedFileFail:
            this.displayMessage(this.errorLoad);
            break;

          case ActionTypes.LoadStationsFail:
            const messageLoad = 'There was a problem with load the station file. Please contact the administrator.';
            this.displayMessage(messageLoad);
            break;
          default:
            break;
        }
      });

  }
}
