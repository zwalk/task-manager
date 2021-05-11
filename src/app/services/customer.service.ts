import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer } from '../models/Customer';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  endpoint: string = 'http://localhost:8080';
  headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Bearer " + this.authService.token);
  
  constructor(private http: HttpClient, private authService : AuthService) {   }

  public getAll() : Observable<Customer[]> {
    this.setHeaders();
    return this.http.get<Customer[]>(`${this.endpoint}/customers`, {headers: this.headers});
  }

  public add(name: string) : Observable<void> {
    this.setHeaders();
    return this.http.post<void>(`${this.endpoint}/customers`, {name: name}, {headers: this.headers});
  }

  public edit(id : number, name: string) : Observable<void> {
    this.setHeaders();
    return this.http.put<void>(`${this.endpoint}/customers/${id}`, {name: name}, {headers: this.headers})
  }

  public delete(id: number) : Observable<void> {
    this.setHeaders();
    return this.http.delete<void>(`${this.endpoint}/customers/${id}`, {headers: this.headers});
  }

  private setHeaders() {
    this.headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Bearer " + this.authService.token);
  }

}
