import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventApi, DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
import { createEventId, INITIAL_EVENTS } from '../event-utils';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Appointment } from '../models/appointment';
import { AppointmentService } from '../services/appointment.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';
import { TIME_SLOT } from '../models/timeSlot';
import { DoctorService } from '../services/doctor.service';

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  interactionPlugin
])


@Component({
  selector: 'app-show-calendar',
  templateUrl: './show-calendar.component.html',
  styleUrls: ['./show-calendar.component.css']
})
export class ShowCalendarComponent implements OnInit, AfterViewInit {
  appointments: Appointment[] = [];
  events: EventInput[] = [];
  doctors: User[] = [];
  calendarOptions: CalendarOptions = {};
  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;
  calendarVisible = true;
  @ViewChild('content') content?: ElementRef;
  currentEvents: EventApi[] = [];
  TODAY_STR = new Date().toISOString().replace(/T.*$/, '');
  closeResult: string = "";

  availableTimeSlots: string[] = Object.values(TIME_SLOT)
  availableDoctors: User[] = []
  selectedTimeSlot = "Select Time Slot"
  selectedDoctor = "Select a Doctor"
  appointment: Appointment = {}

  loggedInUser: User = {}
  selectInfo: any;

  constructor(
    private appointmentService: AppointmentService,
    private modalService: NgbModal,
    private authService: AuthService,
    private docotorService: DoctorService
  ) { }

  ngOnInit(): void {
    this.docotorService.getDoctors().subscribe(
      (doctors) => {
        this.doctors = doctors;
      }
    )
    this.authService.getCurrentLoggedInUser()!.subscribe(
      (user) => {
        this.loggedInUser = user
      }
    )
    const startOfMonth = new Date()
    const endOfMonth = new Date()
    this.calendarOptions = this.populateCalendarOption()
    this.appointmentService.getAppointments(startOfMonth, endOfMonth).subscribe(
      (appointments) => {
        this.appointments = appointments
        this.appointments.forEach(
          (appointment) => {
            this.addAppointmentToCalendar(appointment)
          }
        )
      }
    )
  }

  ngAfterViewInit(): void {
  }

  getAvailableDoctors(): void {

  }

  handleCalendarToggle() {
    this.calendarVisible = !this.calendarVisible;
  }

  handleWeekendsToggle() {
    const { calendarOptions } = this;
    calendarOptions.weekends = !calendarOptions.weekends;
  }


  onDoctorChange(event: any): void {
    const doctor = this.doctors.filter(d => d.login === event.target.value)[0]
    if(doctor){
      this.availableTimeSlots = this.getAvailableTimeSlots(doctor, this.selectInfo.startStr)
    }else{
      console.log("doctor not found:")
      this.availableTimeSlots = Object.values(TIME_SLOT)
    }    
  }

  doctorHasAppointmentInTimeSlot(timeSlot: any, doctor: User): boolean {
    const date = this.selectInfo.startStr
    return this.appointments.filter(
      function (appointment) {
        const dateStart = new Date(appointment.dateStart!).toISOString()
        const dateEnd = new Date(appointment.dateEnd!).toISOString()
        let docHasAppointment = appointment.doctor!.login === doctor.login && dateStart.indexOf(date) != -1
        const startHour = dateStart.split("T")[1].split(":")[0]
        const endHour = dateEnd.split("T")[1].split(":")[0]
        docHasAppointment = docHasAppointment && timeSlot === startHour + "h => " + endHour + "h"
        return docHasAppointment
      }
    ).length > 0
  }

  openAddAppointmentModal(content: any, selectInfo: any): void {
    this.selectInfo = selectInfo
    this.availableDoctors = this.doctors.filter(
      d => this.getAvailableTimeSlots(d, selectInfo.startStr).length > 0
    )
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        let appointment = new Appointment();
        appointment.dateStart = selectInfo.startStr + this.getTime(this.selectedTimeSlot).startTime
        appointment.dateEnd = selectInfo.startStr + this.getTime(this.selectedTimeSlot).endTime
        appointment.doctor = this.availableDoctors.filter(d => d.login === this.selectedDoctor)[0]
        // add parent and child info
        appointment.parent = this.loggedInUser
        this.addAppointmentToCalendar(appointment)
        this.appointments.push(appointment)
        console.log("new appointments:"+ JSON.stringify(this.appointments))
        this.selectedDoctor = "Select a Doctor"
        this.selectedTimeSlot = "Select Time Slot"
        //save new appointment in backend
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  }

  getDismissReason(reason: any) {
    console.log("closed")
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    console.log("clicked")
    this.openAddAppointmentModal(this.content, selectInfo)
  }



  getAvailableTimeSlots(doctor: User, date: string): string[] {
    if (this.appointments) {
      const appointmentsOfDoctor = this.appointments.filter(
        function (appointment) {
          return appointment.doctor!.login === doctor.login && appointment.dateStart!.toString().indexOf(date) != -1
        }
      )

      if (appointmentsOfDoctor.length === 0) {
        console.log("no appointments for doctor")
        return Object.values(TIME_SLOT)
      }
      let timeSlots = Object.values(TIME_SLOT)
      const avaialbleTimeSlots = timeSlots.filter(
        function (timeSlot) {
          return appointmentsOfDoctor.filter(
            (appointment) => {
              const hourFromDate = appointment.dateStart!.toString().split("T")[1]
              const hourTimeSlot = timeSlot.split(" => ")[0]
              const condition = !(hourFromDate.indexOf(hourTimeSlot) != -1)
              return condition
            }
          ).length !== 0
        }
      )
      return avaialbleTimeSlots
    }else{
      console.log("no appointments")
      return Object.values(TIME_SLOT)
    }
    
  }

  addAppointmentToCalendar(appointment: Appointment) {
    let dateStart = new Date().toISOString()
    let dateEnd = new Date().toISOString()
    if (appointment.dateStart) {
      dateStart = new Date(appointment.dateStart).toISOString()
    }
    if (appointment.dateEnd) {
      dateEnd = new Date(appointment.dateEnd).toISOString()
    }
    this.calendarComponent?.getApi().addEvent(
      {
        id: createEventId(),
        title: appointment.doctor!.login + " AP" + appointment.id + "_" + appointment.parent!.childName,
        start: dateStart,
        end: dateEnd,
        allDay: false
      }
    )
  }

  getTime(timeSlot: string): TimeStartEnd {
    // 08h => 09h
    let start = timeSlot.split(" => ")[0]
    let end = timeSlot.split(" => ")[1]
    return { startTime: "T" + start + ":00", endTime: "T" + end + ":00" }
  }

  handleEventClick(clickInfo: EventClickArg) {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove();
    }
  }
  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }
  populateCalendarOption() {
    const calendarOptions: CalendarOptions = {
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      initialView: 'dayGridMonth',
      initialEvents: [], // alternatively, use the `events` setting to fetch from a feed
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventsSet: this.handleEvents.bind(this)
      //you can update a remote database when these fire:
      //eventAdd:
      //eventChange:
      //eventRemove:
    };
    return calendarOptions
  }
}

class TimeStartEnd {
  startTime?: string;
  endTime?: string;
}
