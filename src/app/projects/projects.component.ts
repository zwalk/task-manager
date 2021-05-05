import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Customer } from '../models/Customer';
import { Project } from '../models/Project';
import { AuthService } from '../services/auth.service';
import { CustomerService } from '../services/customer.service';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  projects : Project[] = [];
  customers : Customer[] = [];
  isAdding : boolean = false;
  isLoading : boolean = false;
  isProjectAddFormVisible : boolean = false
  addErrorMessage : string | undefined = undefined;

  constructor(private authService : AuthService, private projectService : ProjectService, 
    private customerService : CustomerService) { }

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
    } else {
      this.refreshApp()
    }

  }

  getCustomerName(id : number | undefined) : string | undefined {
    return this.customers.find((customer) => customer.id === id)?.name;
  }

  refreshApp() {
    window.location.href = "http://localhost:4200"
  }

  toggleProjectAddForm() {
    this.isProjectAddFormVisible = !this.isProjectAddFormVisible;
    if (this.addErrorMessage) {
      this.addErrorMessage = undefined;
    }
  }

  add(data : any) {
    this.isAdding = true;
    this.projectService.add(data.name, data.customerId).subscribe({
      next: () => {
        this.isAdding = false;
        this.toggleProjectAddForm();
        this.projectService.getAll().subscribe((res) => this.projects = res);
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

  toggleEditForm(project : Project) {
    project.isBeingEdited = !project.isBeingEdited;
    if (!project.isBeingEdited) {
      project.errorMessage = undefined;
    }
  }

  edit(data : any, id : number | undefined) {
    this.isLoading = true;
    if (id != undefined) {
      this.projectService.edit(id, data.name, data.customerId).subscribe({
        next: () => {
          this.isLoading = false;
          this.projectService.getAll().subscribe((res) => this.projects = res);
        },
        error: (res) => {
          this.isLoading = false;
          const selectedProject : Project | undefined = this.projects?.find( project => project.id === id);
          if (selectedProject != undefined) {
            if (res.error.message.includes('Validation')) {
              selectedProject.errorMessage = res.error.errors[0].defaultMessage;
            } else {
              selectedProject.errorMessage = res.error.message;
            }
            
          }
        }
      })
    }

  }

  delete(id : number | undefined) {
    this.isLoading = true;
    if (id != undefined) {
      this.projectService.delete(id).subscribe({
        next: () => {
          this.isLoading = false;
          this.projectService.getAll().subscribe((res) => this.projects = res);
        },
        error: (res) => {
          this.isLoading = false;
          const selectedProject : Project | undefined = this.projects?.find( projects => projects.id === id);
          if (selectedProject != undefined) {
            selectedProject.errorMessage = res.error.message;
          }
        }
      })
    }
  }

}
