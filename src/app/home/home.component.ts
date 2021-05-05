import { Component, OnInit } from '@angular/core';
import { User } from '../models/User';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  isLoggedIn : boolean = false;
  currentUser : User | undefined;
  
  constructor(private authService : AuthService) {
    this.isLoggedIn = authService.isLoggedIn;
    this.currentUser = authService.currentUser;
  }

  ngOnInit(): void {
  }

}
