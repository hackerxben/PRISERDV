import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { User } from "../models/user";

@Injectable({ providedIn: 'root' })
export class DoctorService {
    constructor(
        private http: HttpClient
    ){}
    
    public getDoctors(): Observable<User[]>{
        return this.http.get<User[]>(environment.baseUrl+"/getDoctors");
    }
}