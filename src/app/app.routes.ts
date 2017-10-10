import { Routes } from '@angular/router';
import { AuthGuard } from './_guards/auth.guard';
import { HomeComponent } from './modules/home';
import { LoginComponent } from './components/login';
import { AboutComponent } from './modules/about';
import { NoContentComponent } from './modules/no-content';

export const ROUTES: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'about', component: AboutComponent, canActivate: [AuthGuard]},
    {path: '**', component: NoContentComponent},
];
