import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface CustomauthResult {
  access_token: string;
  id_token: string;
}

const clientId = '4oku675mboivi0kjb4rak3bams';
const domainPrefix = '';
let redirectUrl = 'http://localhost:4200';
const timeForTokenRefresh = 5 * 60 * 1000;

const idTokenStorageKey = 'token';
const accessTokenStorageKey = 'access_token';
const helper = new JwtHelperService();

@Injectable()
export class AuthService {
  public awsUrl = `${domainPrefix}/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUrl}&state=STATE&scope=openid+email`;
  private _soragedToken;

  private get soragedToken() {
    return this._soragedToken;
  }

  private _decodedToken;
  private get decodedToken() {
    return this._decodedToken;
  }

  constructor(
    private router: Router,
    public http: HttpClient,
  ) {
    this.checkLocalEnviroment();
    this.checkCode();
    this.initDecodedToken();
    this.setTime();
   // this.awsUrl = `${domainPrefix}/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUrl}&state=STATE&scope=openid+email`;
  }

  public getCredentialFromLocalstarage() {
    localStorage.getItem('userPassword');
    return true;
  }

  public setTime() {
    if (!helper.isTokenExpired(this.soragedToken)) {
      const decocedToken = this.decodedToken;
      if (decocedToken !== undefined) {
        const leftTimeToExpiriance = decocedToken.exp * 1000 - Date.parse((<any>new Date()));
        const timeToTokenRefresh = leftTimeToExpiriance - timeForTokenRefresh;
        setTimeout(() => {
          //this.refreshTokenCall();
        }, timeToTokenRefresh);
      }
    }
  }

  public refreshTokenCall() {
    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', clientId)
      .set('code', localStorage.getItem('code'))
      .set('refresh_token', localStorage.getItem('refresh_token'));

    this.http.post(domainPrefix + '/oauth2/token', body).subscribe((data) => {
      this.setUser((<any>data).access_token, (<any>data).id_token, null);
      this.initDecodedToken();
      this.setTime();
    }, (err) => {
      console.error(err);
      window.location.href = `/`;
    });
  }

  public checkLocalEnviroment() {
    const localhostKeyWord = 'localhost';
    const searchResult = window.location.origin.search(localhostKeyWord);
    if (searchResult > -1) {
      redirectUrl = window.location.origin
    }
  }

  private setUser(accessToken: string, idToken: string, reloadToken: string): void {
    if (accessToken !== null) {
      localStorage.setItem('access_token', accessToken);
    }
    if (idToken !== null) {
      localStorage.setItem('token', idToken);
    }
    if (reloadToken !== null) {
      localStorage.setItem('refresh_token', reloadToken);
    }
  }

  public checkCode() {
    if ((/access_token|token|error|id_token|code/).test(window.location.search)) {
      let locationHash = window.location.search;
      if (locationHash.startsWith('?')) {
        locationHash = locationHash.substring(1);
      }
      const authResult: CustomauthResult = {
        access_token: '',
        id_token: ''
      };
      locationHash.split('&').forEach((item) => {
        const splitted = item.split('=');
        authResult[splitted[0]] = splitted[1];
      });
      localStorage.setItem('code', authResult['code']);
      window.history.pushState('', '', '/');
    }
  }

  private initDecodedToken(): void {
    const rawIdToken = localStorage.getItem(idTokenStorageKey);

    if (rawIdToken) {
      this._soragedToken = rawIdToken;
      this._decodedToken = helper.decodeToken(rawIdToken);

    }
  }

  public get checkCodeExist() {
    const code = localStorage.getItem('code');
    return code;
  }

  public canActivateRoute(url): boolean | Observable<any> {
    if (this.checkCodeExist !== null && !this.loggedIn()) {
      const body = new HttpParams()
        .set('grant_type', 'authorization_code')
        .set('client_id', clientId)
        .set('code', localStorage.getItem('code'))
        .set('redirect_uri', redirectUrl);
      localStorage.removeItem('code');
      return this.http.post(domainPrefix + '/oauth2/token', body).pipe(
        map((data) => {
          this.setUser((<any>data).access_token, (<any>data).id_token, (<any>data).refresh_token);
          this._soragedToken = (<any>data).id_token;
          this._decodedToken = helper.decodeToken((<any>data).id_token);
          this.setTime();
          return true;
        }));
    }
    if (!this.loggedIn()) {
      this.router.navigate(['login']);
      return false;
    }

    return true;

  }

  private unsetUser(): void {
    localStorage.removeItem(accessTokenStorageKey);
    localStorage.removeItem(idTokenStorageKey);
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('code');
    this.removeDecodedToken();
  }

  private removeDecodedToken(): void {
    this._soragedToken = null;
    this._decodedToken = null;
  }

  public login() {
    window.location.href = this.awsUrl;
  }

  public loggedIn(): boolean {
    const isExpired = helper.isTokenExpired(this.soragedToken);
    return !isExpired;
  }

  /**
   * isUserLoggedIn function is used to detect if token is invalid after change tab
   */
  public isUserLoggedIn() {
   // this.refreshTokenCall();
  }

  public logout() {
    this.unsetUser();
    window.location.href = `/`;
  }

}
