import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { AppState } from '../../app.service';
import { Router } from '@angular/router';

/**
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    'app.component.styl'
  ],
  templateUrl: './app.component.pug'
})
export class AppComponent implements OnInit {
  constructor(
    public appState: AppState,
    public router: Router,
    public authService: AuthService) {
  }

  public ngOnInit() {
    console.log('Initial App State', this.appState.state);
  }

  public logout() {
    this.authService.logout();
      this.router.navigate(['/login']);
  }

}