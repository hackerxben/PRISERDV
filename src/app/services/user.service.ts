import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { User } from "../models/user";

@Injectable({ providedIn: 'root' })
export class UserService {
    httpOptions = {
        headers: new HttpHeaders({ 'Access-Control-Allow-Origin': '*' })
    }
    constructor(
        private http: HttpClient
    ) { }
    public getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(environment.baseUrl + "/users", this.httpOptions)
    }

    public getMyInfos(): Observable<User> | undefined {
        const token = localStorage.getItem("AuthToken")
        if (token) {
            return this.http.get<User>(environment.baseUrl + "/getMyInfos")
        } else {
            console.log("user is not logged in")
            return undefined
        }
    }

    isDoctor(user: User): boolean {
        let isDoctor = false;
        if (!user.childName || user.childName.length === 0) {
            if (user.description && user.description.length > 0 && user.speciality && user.speciality.length > 0) {
                isDoctor = true
            }
        }
        return isDoctor
    }

    isParent(user: User): boolean {
        let isParent = false;
        if (
            (!user.description || user.description.length === 0) &&
            (!user.speciality || user.speciality.length === 0)
        ) {
            if (user.childName && user.childName.length > 0) {
                isParent = true
            }
        }
        return isParent
    }
}