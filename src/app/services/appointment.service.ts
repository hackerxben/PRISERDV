import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Appointment } from "../models/appointment";
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from "src/environments/environment";

@Injectable({ providedIn: 'root' })
export class AppointmentService {
    httpOptions = {
        headers: new HttpHeaders({ 'Access-Control-Allow-Origin': '*' })
    }
    constructor(
        private http: HttpClient
    ) { }
    public getAppointments(startDate: Date, endDate: Date): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(environment.baseUrl + "/appointments", this.httpOptions)
    }
}