import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from '../models/Project';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  endpoint: string = 'http://localhost:8080';
  headers = new HttpHeaders();

  constructor(private http: HttpClient, private authService : AuthService) {   }

  public getAll() : Observable<Project[]> {
    this.setHeaders();
    return this.http.get<Project[]>(`${this.endpoint}/projects`, {headers: this.headers});
  }

  public add(name: string, customerId : number) : Observable<void> {
    this.setHeaders();
    return this.http.post<void>(`${this.endpoint}/projects`, {name: name, customerId: customerId}, {headers: this.headers});
  }

  public edit(id : number, name: string, customerId : number) : Observable<void> {
    this.setHeaders();
    return this.http.put<void>(`${this.endpoint}/projects/${id}`, {name: name, customerId: customerId}, {headers: this.headers})
  }

  public delete(id: number) : Observable<void> {
    this.setHeaders();
    return this.http.delete<void>(`${this.endpoint}/projects/${id}`, {headers: this.headers});
  }

  private setHeaders() {
    this.headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Bearer " + this.authService.token);
  }
}
