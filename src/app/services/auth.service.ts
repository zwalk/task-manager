import { Injectable } from '@angular/core';
import { User } from '../models/User';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  endpoint: string = 'http://localhost:8080';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  currentUser : User | undefined;
  isLoggedIn : boolean = false;
  token : string | undefined;

  constructor(
    private http: HttpClient
  ) {
  }

  signIn(username : string, password : string) : Observable<void> {
    return this.http.post<any>(`${this.endpoint}/authenticate`, {username: username, password: password})
      .pipe(
        map((res: any) => {
          this.token = res.token
          this.currentUser = res;
          this.isLoggedIn = true;
        })
      )}

    logOut() {
      this.currentUser = undefined;
      this.token = undefined;
    }

    signUp(username : string, password : string) : Observable<void> {
      return this.http.post<any>(`${this.endpoint}/register`, {username: username, password: password});
    }
}
