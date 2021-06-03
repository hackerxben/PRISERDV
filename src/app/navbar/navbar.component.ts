import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{

  user: User = {firstName:"Test",lastName:"test"}
  currentUrl: string = ""
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }
  
  ngOnInit(): void {
    this.currentUrl = window.location.href
  }

  isAuthenticated(): boolean{
    return this.authService.getToken() !== undefined && this.authService.getToken() !== null && this.authService.getToken() !== ""
  }

  ulClick(): void{
    console.log("clicked")
    this.currentUrl = window.location.href
  }

  logout(): void{
    localStorage.removeItem("AuthToken")
    this.router.navigateByUrl("/login")
  }

}
