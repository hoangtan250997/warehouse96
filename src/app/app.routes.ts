import { Routes } from '@angular/router';
import { HomePage } from './home/home';
import { LoginPage } from './login/login';
import { ReportPage } from './report/report';
import { authGuard } from './service/auth.guard';

export const routes: Routes = [
  { path: '', component: HomePage, canActivate: [authGuard] },
  { path: 'report', component: ReportPage, canActivate: [authGuard] },
  { path: 'login', component: LoginPage },
  { path: '**', redirectTo: '' },
];
