import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';


import { Observable } from 'rxjs/Observable';
import { LoginService } from '../../_services/login/login.service';

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(private router: Router, private loginService: LoginService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.loginService.loggedIn()) {
      return true;
    } else {
      this.router.navigate(['menu/home']);
      return false;
    }
  }
}
