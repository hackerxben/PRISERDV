import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { LoginResponse } from "../models/loginResponse";
import { User } from "../models/user";

@Injectable({ providedIn: 'root' })
export class AuthService {
    httpOptions = {
        headers: new HttpHeaders({ 'Access-Control-Allow-Origin': '*' })
    }
    constructor(
        private http: HttpClient
    ) { }


    public login(user: User):Observable<LoginResponse> {
        return this.http.post<LoginResponse>(environment.baseUrl+"/login",user)
    }
    public isAuthenticated(): boolean{
        return this.getToken() !== undefined && this.getToken() !== null && this.getToken() !== ""
    }
    public getToken(): string {
        return localStorage.getItem("AuthToken")!
    }
    public getCurrentLoggedInUser(): Observable <User> | undefined {
        const token = localStorage.getItem("AuthToken")
        if (token) {
            return this.http.get<User>(environment.baseUrl + "/getMyInfos")
        } else {
            console.log("user is not logged in")
            return undefined
        }
    }
}