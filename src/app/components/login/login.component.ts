import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

import { IUser, User } from '../../entities/user';
import { HasLoadingInterface } from '../ui/has-loading.interface';
import 'rxjs/add/operator/retry';

@Component({
  styleUrls: [
    'login.component.styl'
  ],
  templateUrl: 'login.component.pug'
})
export class LoginComponent implements OnInit {
  public isLoading: boolean;
  private userModel: User = new User({} as IUser);
  private returnUrl: string;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService) {
    this.isLoading = false;
  }

  public ngOnInit(): void {
    this.authService.logout();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  public login() {
    this.isLoading = true;
    this.authService
      .login(this.userModel.username, this.userModel.password)
      .subscribe(
        (data) => {
          console.log('Login success:', data);
          return this.router.navigate([this.returnUrl]);
        },
        (error) => {
          console.log(error);
          this.isLoading = false;
        }
      );
  }
}
