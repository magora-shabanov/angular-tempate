import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { backendRoutes, HttpService } from './http/http.service';
import { IUser, User } from '../entities/user';

@Injectable()
export class AuthService {
  private loggedIn: boolean;
  private loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);

  private router: Router;

  constructor(router: Router, private http: HttpService) {
    this.router = router;
    this.setLoggedIn(this.firstAuthenticatedCheck());
  }

  public setLoggedIn(value: boolean) {
    this.loggedIn$.next(value);
    this.loggedIn = value;
  }

  public login(username: string, password: string) {
    return this.http
      .post(backendRoutes.auth, JSON.stringify({username, password}))
      .map((response: Response) => {
        const user = new User(response.json().data as IUser);
        if (user && user.authToken) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.setLoggedIn(true);
        }
        return user;
      });
  }

  public logout() {
    localStorage.removeItem('currentUser');
    // Remove tokens and profile and update login status subject
    this.setLoggedIn(false);
  }

  get authenticated() {
    return this.loggedIn;
  }

  private firstAuthenticatedCheck(): boolean {
    const currentUserInfo = localStorage.getItem('currentUser');
    return currentUserInfo !== null;
  }
}
