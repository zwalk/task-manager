import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TaskLog } from '../models/TaskLog';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskLogService {
  endpoint: string = 'http://localhost:8080';
  headers : HttpHeaders = new HttpHeaders();
  
  constructor(private http: HttpClient, private authService : AuthService) {   }

  public getAll() : Observable<TaskLog[]> {
    this.setHeaders();
    return this.http.get<TaskLog[]>(`${this.endpoint}/task-logs`, {headers: this.headers});
  }

  public add(taskId: number) : Observable<void> {
    this.setHeaders();
    return this.http.post<void>(`${this.endpoint}/task-logs`, {taskId: taskId, 
      userId: this.authService.currentUser?.id}, {headers: this.headers});
  }

  public endTimer(taskLogId : number, taskId : number) : Observable<void> {
    this.setHeaders();
    return this.http.put<void>(`${this.endpoint}/task-logs/${taskLogId}`, {taskId: taskId, 
      userId: this.authService.currentUser?.id}, {headers: this.headers});
  }

  private setHeaders() {
    this.headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Bearer " + this.authService.token);
  }

}
