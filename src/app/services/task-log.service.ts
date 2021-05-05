import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TaskLog } from '../models/taskLog';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskLogService {
  endpoint: string = 'http://localhost:8080';
  headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', "Bearer " + this.authService.token);
  
  constructor(private http: HttpClient, private authService : AuthService) {   }

  public getAll() : Observable<TaskLog[]> {
    return this.http.get<TaskLog[]>(`${this.endpoint}/task-logs`, {headers: this.headers});
  }

  public add(taskId: number, durationInMinutes : number) : Observable<void> {
    return this.http.post<void>(`${this.endpoint}/task-logs`, {taskId: taskId, durationInMinutes: durationInMinutes, 
      userId: this.authService.currentUser?.id}, {headers: this.headers});
  }

}
