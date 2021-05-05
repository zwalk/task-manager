import { Component, OnInit } from '@angular/core';
import { Customer } from '../models/Customer';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { TaskLog } from '../models/taskLog';
import { AuthService } from '../services/auth.service';
import { CustomerService } from '../services/customer.service';
import { ProjectService } from '../services/project.service';
import { TaskLogService } from '../services/task-log.service';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  tasks : Task[] = [];
  projects : Project[] = [];
  customers : Customer[] = [];
  taskLogs : TaskLog[] = [];
  isAdding : boolean = false;
  isLoading : boolean = false;
  isTaskAddFormVisible : boolean = false
  addErrorMessage : string | undefined = undefined;
  logTimeErrorMessage : string | undefined = undefined;

  constructor(private authService : AuthService, private taskService : TaskService, private projectService : ProjectService, 
    private customerService : CustomerService, private taskLogService : TaskLogService) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.taskService.getAll().subscribe({
        next: (res) => {this.tasks = res},
        error: () => {this.refreshApp()}
      })
      this.customerService.getAll().subscribe({
        next: (res) => {this.customers = res},
        error: () => {this.refreshApp()}
      })
      this.projectService.getAll().subscribe({
        next: (res) => {this.projects = res},
        error: () => {this.refreshApp()}
      })
      this.taskLogService.getAll().subscribe({
        next: (res) => {this.taskLogs = res},
        error: () => {this.refreshApp()}
      })
    } else {
      this.refreshApp()
    }

  }

  getYourHours(taskId : number | undefined) : number | undefined {
    let response : number | undefined = undefined;
    if (taskId != undefined) {
      const matchingTaskLogs = this.taskLogs.filter((taskLog) => {
        return taskLog.taskId == taskId && taskLog.userId == this.authService.currentUser?.id
      }).map(taskLog => taskLog.durationInMinutes)
      if (matchingTaskLogs.length != 0) {
        const totalMinutes = (matchingTaskLogs.reduce((sum, duration) => {
          if (sum && duration) {
            return sum + duration 
          } else {
            return sum;
          }
        }));
        if (totalMinutes != undefined) {
          response = totalMinutes / 60;
        }
      } else {
        response = 0;
      }
      }

    return response;
  }

  getTotalHours(taskId : number | undefined) : number | undefined {
    let response : number | undefined = undefined;
    if (taskId != undefined) {
      const matchingTaskLogs = this.taskLogs.filter((taskLog) => taskLog.taskId === taskId).map(taskLog => taskLog.durationInMinutes)
      if (matchingTaskLogs.length != 0) {
        const totalMinutes = (matchingTaskLogs.reduce((sum, duration) => {
          if (sum && duration) {
            return sum + duration 
          } else {
            return sum;
          }
        }));
        if (totalMinutes != undefined) {
          response = totalMinutes / 60;
        }
      } else {
        response = 0;
      }
      }

    return response;
  }

  getCustomerName(projectId : number | undefined) : string | undefined {
    const selectedProject : Project | undefined = this.projects.find((project) => project.id === projectId);
    return this.customers.find((customer) => customer.id == selectedProject?.customerId)?.name;
  }

  getCustomerNameFromProject(project : Project) : string | undefined {
    return this.customers.find((customer) => customer.id == project?.customerId)?.name;
  }

  getProjectName(id : number | undefined) : string | undefined {
    return this.projects.find((project) => project.id === id)?.name;
  }

  refreshApp() {
    window.location.href = "http://localhost:4200"
  }

  toggleTaskAddForm() {
    this.isTaskAddFormVisible = !this.isTaskAddFormVisible;
    if (this.addErrorMessage) {
      this.addErrorMessage = undefined;
    }
  }

  add(data : any) {
    this.isAdding = true;
    this.taskService.add(data.description, data.projectId).subscribe({
      next: () => {
        this.isAdding = false;
        this.toggleTaskAddForm();
        this.taskService.getAll().subscribe((res) => this.tasks = res);
      },
      error: (res) => {
        this.isAdding = false;
        if (res.error.message.includes('Validation')) {
          this.addErrorMessage = res.error.errors[0].defaultMessage;
        } else {
          this.addErrorMessage = res.error.message;
        }
      }
    })
  }

  toggleEditForm(task : Task) {
    task.isBeingEdited = !task.isBeingEdited;
    task.errorMessage = undefined;
  }

  edit(data : any, id : number | undefined) {
    this.isLoading = true;
    if (id != undefined) {
      this.taskService.edit(id, data.description, data.projectId).subscribe({
        next: () => {
          this.isLoading = false;
          this.taskService.getAll().subscribe((res) => this.tasks = res);
        },
        error: (res) => {
          this.isLoading = false;
          const selectedTask : Task | undefined = this.tasks?.find( task => task.id === id);
          if (selectedTask != undefined) {
            if (res.error.message.includes('Validation')) {
              selectedTask.errorMessage = res.error.errors[0].defaultMessage;
            } else {
              selectedTask.errorMessage = res.error.message;
            }
            
          }
        }
      })
    }

  }

  delete(task : Task | undefined) {
    this.isLoading = true;
    if (task?.id != undefined) {
      this.taskService.delete(task.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.taskService.getAll().subscribe((res) => this.tasks = res);
        },
        error: (res) => {
          this.isLoading = false;
          if (task != undefined) {
            task.errorMessage = res.error.message;
          }
        }
      })
    }
  }

  logTime(data : any, task : Task) {
    this.isLoading = true;
    console.log(task.id);
    if (task.id) {
      this.taskLogService.add(task.id, data.hours*60).subscribe({
        next: () => {
          this.isLoading = false;
          task.isTimeBeingLogged = false;
          this.taskLogService.getAll().subscribe((res) => this.taskLogs = res)
        },
        error: (res) => {
          if (res.error.message.includes('Validation')) {
            task.taskLogError = res.error.errors[0].defaultMessage;
          } else {
            task.taskLogError = res.error.message;
          }
        }

      })
    }

  }

  toggleHoursForm(task : Task) {
    task.isTimeBeingLogged = !task.isTimeBeingLogged;
    task.taskLogError = undefined;
    task.errorMessage = undefined;
  }
}
