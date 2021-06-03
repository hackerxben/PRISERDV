import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }
  
  loginForm = this.fb.group(
    {
      login: ['', [Validators.required]],
      password : ['',[Validators.required]]
    }
  )
  ngOnInit(): void {
  }

  login():void{
    let user = new User()
    user.login = this.loginForm.get("login")!.value
    user.password = this.loginForm.get("password")!.value
    this.authService.login(user).subscribe(
      (loginResponse)=>{
          if(loginResponse.AuthToken){
              console.log("should be a success")
              localStorage.setItem("AuthToken",loginResponse.AuthToken);
              this.router.navigateByUrl('/calendar')
          }
      }
  )
  }

}
