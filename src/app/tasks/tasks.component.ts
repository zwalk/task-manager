import { Component, OnInit } from '@angular/core';
import { Customer } from '../models/Customer';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { TaskLog } from '../models/TaskLog';
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
  isStartTimeLoading : boolean = false;

  constructor(private authService : AuthService, private taskService : TaskService, private projectService : ProjectService, 
    private customerService : CustomerService, private taskLogService : TaskLogService) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.customerService.getAll().subscribe({
        next: (res) => {this.customers = res},
        error: () => {this.refreshApp()}
      })
      this.projectService.getAll().subscribe({
        next: (res) => {this.projects = res},
        error: () => {this.refreshApp()}
      })
      this.taskLogService.getAll().subscribe({
        next: (res) => {
          this.taskLogs = res
          this.taskService.getAll().subscribe({
            next: (res) => {
              this.tasks = res;
              this.tasks.forEach(task => { 
                if(this.taskLogs.filter(taskLog => taskLog.taskId === task.id && taskLog.endTime == null) 
                .find(taskLog => taskLog.userId == this.authService.currentUser?.id)) {
                  task.isTimeBeingLogged = true;
                  this.setTime(task);
                } else {
                  task.isTimeBeingLogged = false;
                  task.time = undefined;
                }
               })
            },
            error: () => {this.refreshApp()}
          })
        },
        error: () => {this.refreshApp()}
      })

    } else {
      this.refreshApp();
    }

  }

  getYourHours(taskId : number | undefined) : number | undefined {
    let response : number | undefined = undefined;
    if (taskId != undefined) {
      const matchingTaskLogs = this.taskLogs.filter((taskLog) => {
        return taskLog.taskId == taskId && taskLog.userId == this.authService.currentUser?.id
      }).map(taskLog => taskLog.durationInSeconds)
      if (matchingTaskLogs.length != 0) {
        const totalMinutes = (matchingTaskLogs.reduce((sum, duration) => {
          if (sum && duration) {
            return sum + duration 
          } else {
            return sum;
          }
        }));
        if (totalMinutes != undefined) {
          response = totalMinutes / 3600;
        }
      } else {
        response = 0;
      }
      }
      if (response) {
        response = +response.toFixed(2);
      }

    return response;
  }

  getTotalHours(taskId : number | undefined) : number | undefined {
    let response : number | undefined = undefined;
    if (taskId != undefined) {
      const matchingTaskLogs = this.taskLogs.filter((taskLog) => taskLog.taskId === taskId).map(taskLog => taskLog.durationInSeconds);
      if (matchingTaskLogs.length != 0) {
        const totalMinutes = (matchingTaskLogs.reduce((sum, duration) => {
          if (sum && duration) {
            return sum + duration 
          } else {
            return sum;
          }
        }));
        if (totalMinutes != undefined) {
          response = totalMinutes / 3600;
        }
      } else {
        response = 0;
      }
      }

      if (response) {
        response = +response.toFixed(2);
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
        this.tasks.forEach(task => { 
          if(this.taskLogs.filter(taskLog => taskLog.taskId === task.id && taskLog.endTime == undefined) 
          .find(taskLog => taskLog.userId == this.authService.currentUser?.id)) {
            task.isTimeBeingLogged = true;
          }
         })
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
    if (task.id) {
      this.taskLogService.add(task.id).subscribe({
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

  startTimer(task : Task) {
    task.isTimeBeingLogged = !task.isTimeBeingLogged;
    task.isStartTimeLoading = true;
    if (task.id) {
      this.taskLogService.add(task.id).subscribe({
        next: () => {
          task.isStartTimeLoading = false;
          this.taskLogService.getAll().subscribe({
            next: (res) => {
              this.taskLogs = res;
              this.taskService.getAll().subscribe({
                next: (res) => {
                  this.tasks = res;
                  this.tasks.forEach(task => { 
                    if(this.taskLogs.filter(taskLog => taskLog.taskId === task.id && taskLog.endTime == null) 
                    .find(taskLog => taskLog.userId == this.authService.currentUser?.id)) {
                      task.isTimeBeingLogged = true;
                      this.setTime(task);
                    } else {
                      task.isTimeBeingLogged = false;
                      task.time = undefined;
                    }
                   })
                },
                error: () => {
                  this.refreshApp();
                }
              });
            }
          })
        },
        error: (res) => {
          this.isStartTimeLoading = true;
          if (res.error.message.includes('Validation')) {
            task.taskLogError = res.error.errors[0].defaultMessage;
          } else {
            task.taskLogError = res.error.message;
          }
        }

      })
    } else {
      this.isStartTimeLoading = false;
    }
  }

  endTimer(task : Task) {
    this.isStartTimeLoading = true;
    this.taskLogService.getAll().subscribe({
      next: (res) => {
        this.taskLogs = res;
        const taskLog : TaskLog | undefined = this.taskLogs.find(taskLog => taskLog.userId === this.authService.currentUser?.id 
          && taskLog.endTime == null)
          if (taskLog?.id && task.id) {
            this.taskLogService.endTimer(taskLog.id, task.id).subscribe({
              next: () => {
                this.taskLogService.getAll().subscribe((res) => this.taskLogs = res)
                this.taskService.getAll().subscribe((res) => {
                  this.tasks = res
                  this.tasks.forEach(task => { 
                    if(this.taskLogs.filter(taskLog => taskLog.taskId === task.id && taskLog.endTime == null) 
                    .find(taskLog => taskLog.userId == this.authService.currentUser?.id)) {
                      task.isTimeBeingLogged = true;
                      this.setTime(task);
                    } else {
                      task.isTimeBeingLogged = false;
                      task.time = undefined;
                    }
                   })
                   this.isStartTimeLoading = false;
                });
              }
            })
          } else {
            this.isStartTimeLoading = false;
            this.taskLogService.getAll().subscribe({
              next: (res) => {
                this.taskLogs = res
                this.taskService.getAll().subscribe({
                  next: (res) => {
                    this.tasks = res;
                    this.tasks.forEach(task => { 
                      if(this.taskLogs.filter(taskLog => taskLog.taskId === task.id && taskLog.endTime == null) 
                      .find(taskLog => taskLog.userId == this.authService.currentUser?.id)) {
                        task.isTimeBeingLogged = true;
                      } else {
                        task.isTimeBeingLogged = false;
                      }
                     })
                  },
                  error: () => {this.refreshApp()}
                })
              },
              error: () => {this.refreshApp()}
            })
          }
      },
      error: () => {this.refreshApp()}
    })
    
  }

  setTime(task : Task) {
    setInterval(() => {
    const taskLog : TaskLog | undefined = this.taskLogs.filter(taskLog => taskLog.taskId === task.id && taskLog.endTime == null) 
                      .find(taskLog => taskLog.userId == this.authService.currentUser?.id);
    let duration : number = 0;
    if (taskLog?.startTime) {
      duration = new Date().getTime() - new Date(taskLog.startTime).getTime();
    }
    var days = Math.floor(duration / (1000 * 60 * 60 * 24));
    var hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((duration % (1000 * 60)) / 1000);
    
    task.time = days + "d " + hours + "h "
    + minutes + "m " + seconds + "s ";  
    }, 1000);
  }

  getStartTime(task : Task) : Date | undefined{
    const taskLog : TaskLog | undefined = this.taskLogs.filter(taskLog => taskLog.taskId === task.id && taskLog.endTime == null) 
                      .find(taskLog => taskLog.userId == this.authService.currentUser?.id);
    return taskLog?.startTime;
  }


}
