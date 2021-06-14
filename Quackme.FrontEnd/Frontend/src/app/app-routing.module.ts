import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PageNotFoundComponent } from './PageNotFoundComponent/PageNotFound.component';
import { AuthGuard } from './sharedServices/auth.guard';
import { LoginComponent } from './login/login.component';
import { HistoricComponent } from './dashboard/historic/historic.component';

const routes: Routes = [
  {
    path: 'historic',
    component: HistoricComponent,
    //canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    //canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/:id',
    component: DashboardComponent,
    //canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
    //canActivate: [AuthGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
