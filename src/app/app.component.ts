import { Component, ViewChild, ElementRef } from '@angular/core';
import { User } from './models/User';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cmm-task-manager';
  @ViewChild('navBurger') navBurger: ElementRef | undefined;
  @ViewChild('navMenu') navMenu: ElementRef | undefined;
  isLoginFormVisible : boolean = false;
  isLoggedIn : boolean = false;
  currentUser : User | undefined;
  isSigningIn : boolean = false;
  isErrorOnSignIn : boolean = false;
  isSignupFormVisible : boolean = false;
  isCreatingAccount  : boolean = false;
  signUpError : string | undefined = undefined;
  
  constructor(private authService : AuthService) {
  }

  ngOnIt() {
    this.isLoggedIn = this.authService.isLoggedIn;
    this.currentUser = this.authService.currentUser;
  }

  toggleNavBar() {
    if (this.navBurger != undefined && this.navMenu != undefined) {
      this.navBurger.nativeElement.classList.toggle('is-active');
      this.navMenu.nativeElement.classList.toggle('is-active');
    }
  }
  
  toggleLoginForm() {
    this.isSignupFormVisible = false;
    this.isLoginFormVisible = !this.isLoginFormVisible;
    this.isErrorOnSignIn = false;
    this.toggleNavBar();
  }

  toggleSignupForm() {
    this.isLoginFormVisible = false;
    this.isSignupFormVisible = !this.isSignupFormVisible;
    this.toggleNavBar();
  }

  onLogin(data:  any) {
    this.isSigningIn = true;
    this.authService.signIn(data.username, data.password)
    .subscribe({
      next: () => {
        this.isSigningIn = false;
        this.isCreatingAccount = false;
        this.isSignupFormVisible = false;
        this.isLoggedIn = true;
        this.currentUser = this.authService.currentUser;
        this.isLoginFormVisible = false;
      },
      error: () => {
        this.isSigningIn = false;
        this.isErrorOnSignIn = true;
      }
    })
  }

  onLogOut() {
    this.authService.logOut();
    this.isLoggedIn = false;
    this.currentUser = this.authService.currentUser;
  }

  onSignup(data : any) {
    this.isCreatingAccount = true;
    this.authService.signUp(data.username, data.password)
    .subscribe({
      next: () => {
        this.onLogin(data)
      },
      error: (res) => {
        this.isCreatingAccount = false;
        if (res.error.message.includes('Validation')) {
          this.signUpError = res.error.errors[0].defaultMessage;
        } else {
          this.signUpError = res.error.message;
        }
      }
    })
  }

}
