import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Customer } from '../models/Customer';
import { AuthService } from '../services/auth.service';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {

  customers : Customer[] | undefined;
  isLoggedIn : boolean = false;
  isCustomerAddFormVisible : boolean = false;
  isAdding : boolean = false;
  isLoading : boolean = false;
  addErrorMessage : string | undefined = undefined;

  constructor(private customerService : CustomerService, private authService : AuthService) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn;
    if (this.isLoggedIn) {
      this.customerService.getAll().subscribe((res) => this.customers = res);
    } else {
      window.location.href = "http://localhost:4200"
    }
  }

  toggleCustomerAddForm() {
    this.isCustomerAddFormVisible = !this.isCustomerAddFormVisible;
  }

  add(data : any) {
    this.isAdding = true;
    this.customerService.add(data.name).subscribe({
      next: () => {
        this.isAdding = false;
        this.toggleCustomerAddForm();
        this.customerService.getAll().subscribe((res) => this.customers = res);
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

  toggleEditForm(customer : Customer) {
    customer.isBeingEdited = !customer.isBeingEdited;
    if (!customer.isBeingEdited) {
      customer.errorMessage = undefined;
    }
  }

  edit(data : any, id : number | undefined) {
    this.isLoading = true;
    if (id != undefined) {
      this.customerService.edit(id, data.name).subscribe({
        next: () => {
          this.isLoading = false;
          this.customerService.getAll().subscribe((res) => this.customers = res);
        },
        error: (res) => {
          this.isLoading = false;
          const selectedCustomer : Customer | undefined = this.customers?.find( customer => customer.id === id);
          if (selectedCustomer != undefined) {
            if (res.error.message.includes('Validation')) {
              selectedCustomer.errorMessage = res.error.errors[0].defaultMessage;
            } else {
              selectedCustomer.errorMessage = res.error.message;
            }
            
          }
        }
      })
    }

  }

  delete(id : number | undefined) {
    this.isLoading = true;
    if (id != undefined) {
      this.customerService.delete(id).subscribe({
        next: () => {
          this.isLoading = false;
          this.customerService.getAll().subscribe((res) => this.customers = res);
        },
        error: (res) => {
          console.log(res);
          this.isLoading = false;
          const selectedCustomer : Customer | undefined = this.customers?.find( customer => customer.id === id);
          if (selectedCustomer != undefined) {
            selectedCustomer.errorMessage = res.error.message;
          }
        }
      })
    }
  }

}
