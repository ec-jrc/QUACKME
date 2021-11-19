import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../sharedServices/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})

export class LoginComponent implements OnInit, AfterViewInit {
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,

  ) { }

  ngOnInit() { }

  public ngAfterViewInit() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    this.route.queryParams.subscribe(
      (data) => {
        this.authService.login();
      });
  }
}
