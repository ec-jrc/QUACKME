import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DataService } from './sharedServices/data.service';
import { PageNotFoundComponent } from './PageNotFoundComponent/PageNotFound.component';
import { HttpClientModule } from '@angular/common/http';

import { DemoMaterialModule } from './material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MapComponent } from './dashboard/map/map.component';
import { StationsSummaryDataComponent } from './dashboard/stationsSummaryData/stationsSummaryData.component';
import { FileSelectionComponent } from './dashboard/fileSelection/fileSelection.component';
import { FileSelectionService } from './dashboard/fileSelection/fileSelection.service';
import { StoreModule } from '@ngrx/store';
import { reducer, metaReducers } from './reducers';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './app.effects';
import { FileSelectionEffects } from './dashboard/fileSelection/fileSelection.effects';
import { StationsSummaryDataEffects } from './dashboard/stationsSummaryData/stationsSummaryData.effects';
import { StationsSummaryDataService } from './dashboard/stationsSummaryData/stationsSummaryData.service';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthGuard } from './sharedServices/auth.guard';
import { AuthService } from './sharedServices/auth.service';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AlertsComponent } from './dashboard/stationsSummaryData/alerts/alerts.component';
import { CellComponent } from './dashboard/stationsSummaryData/cell/cell.component';
import { CustomInputDirective } from './dashboard/stationsSummaryData/alerts/customValidator.directive';
import { HelperService } from './dashboard/stationsSummaryData/helper.service';
import { FileSelectionListComponent } from './dashboard/fileSelection/fileSelectionList/fileSelectionList.component';
import { LoginComponent } from './login/login.component';
import { FileSelectionDialogComponent } from './dashboard/fileSelection/fileSelectionDialog/fileSelectionDialog.component';
import { ConfirmationDialogComponent } from './dashboard/fileSelection/confirmationDialog/confirmationDialog.component';
import { ServerFlowStatuComponent } from './dashboard/fileSelection/serverFlowStatus/serverFlowStatus.component';
import { HistoricComponent } from './dashboard/historic/historic.component';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { HistoricEffects } from './dashboard/historic/historic.effects';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HeaderComponent,
    PageNotFoundComponent,
    MapComponent,
    StationsSummaryDataComponent,
    FileSelectionComponent,
    AlertsComponent,
    CellComponent,
    CustomInputDirective,
    FileSelectionListComponent,
    LoginComponent,
    FileSelectionDialogComponent,
    ConfirmationDialogComponent,
    ServerFlowStatuComponent,
    HistoricComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    DemoMaterialModule,
    MatDialogModule,
    ScrollingModule,
    SatDatepickerModule, SatNativeDateModule,
    StoreModule.forRoot(reducer, { metaReducers }),
    EffectsModule.forRoot([AppEffects, FileSelectionEffects, StationsSummaryDataEffects, HistoricEffects]),
  ],
  providers: [
    DataService,
    FileSelectionService,
    StationsSummaryDataService,
    HelperService,
    AuthGuard,
    AuthService
  ],
  bootstrap: [AppComponent],
  entryComponents: [FileSelectionDialogComponent, ConfirmationDialogComponent]
})
export class AppModule { }
