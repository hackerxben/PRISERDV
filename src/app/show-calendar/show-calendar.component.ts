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

  constructor(
    private appointmentService: AppointmentService,
    private modalService: NgbModal,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentLoggedInUser()!.subscribe(
      (user) => {
        this.loggedInUser = user
        console.log("currentLoggedinUSEr:"+JSON.stringify(this.loggedInUser))
      }
    )
    const startOfMonth = new Date()
    const endOfMonth = new Date()
    this.calendarOptions = this.populateCalendarOption()
    this.appointmentService.getAppointments(startOfMonth, endOfMonth).subscribe(
      (appointments) => {
        this.appointments = appointments
        console.log("appointments:" + JSON.stringify(this.appointments))
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

  getAvailableDoctors(): void{

  }
  
  handleCalendarToggle() {
    this.calendarVisible = !this.calendarVisible;
  }

  handleWeekendsToggle() {
    const { calendarOptions } = this;
    calendarOptions.weekends = !calendarOptions.weekends;
  }

  openAddAppointmentModal(content: any,selectInfo: any): void {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        let appointment = new Appointment();
        appointment.dateStart = selectInfo.startStr+this.getTime(this.selectedTimeSlot).startTime
        appointment.dateEnd = selectInfo.startStr+this.getTime(this.selectedTimeSlot).endTime
        // add parent and child info
        appointment.parent = this.loggedInUser
        this.addAppointmentToCalendar(appointment)
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  }

  getDismissReason(reason: any) {
    console.log("closed")
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    console.log("clicked")
    this.openAddAppointmentModal(this.content,selectInfo)
  }

  addAppointmentToCalendar(appointment: Appointment){
    let dateStart = new Date().toISOString()
    let dateEnd = new Date().toISOString()
    if(appointment.dateStart){
      console.log("dateStart:"+appointment.dateStart)
      dateStart = new Date(appointment.dateStart).toISOString()
    }
    if(appointment.dateEnd){
      console.log("dateEnd:"+appointment.dateEnd)
      dateEnd = new Date(appointment.dateEnd).toISOString()
    }
    this.calendarComponent?.getApi().addEvent(
      {
        id: createEventId(),
        title: "AP" + appointment.id + "_" + appointment.parent!.childName,
        start: dateStart,
        end: dateEnd,
        allDay: false
      }
    )
  }


  getTime(timeSlot:string): TimeStartEnd{
    // 08h => 09h
    let start = timeSlot.split(" => ")[0].replace("h","")
    let end = timeSlot.split(" => ")[1].replace("h","")
    return {startTime:"T"+start+":00:00",endTime:"T"+end+":00:00"}
  }
  
  handleEventClick(clickInfo: EventClickArg) {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove();
    }
  }
  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }
  populateCalendarOption(){
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
        } ;
    return calendarOptions
  }
}

class TimeStartEnd {
  startTime?: string;
  endTime?: string;
}
