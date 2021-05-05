import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../models/Task';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  
  endpoint: string = 'http://localhost:8080';
  headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Bearer " + this.authService.token);
  
  constructor(private http: HttpClient, private authService : AuthService) {   }

  public getAll() : Observable<Task[]> {
    return this.http.get<Task[]>(`${this.endpoint}/tasks`, {headers: this.headers});
  }

  public add(description: string, projectId : number) : Observable<void> {
    return this.http.post<void>(`${this.endpoint}/tasks`, {description: description, projectId: projectId}, {headers: this.headers});
  }

  public edit(id : number, description: string, projectId : number) : Observable<void> {
    return this.http.put<void>(`${this.endpoint}/tasks/${id}`, {description: description, projectId: projectId}, {headers: this.headers})
  }

  public delete(id: number) : Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/tasks/${id}`, {headers: this.headers});
  }
}
