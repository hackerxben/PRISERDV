import { Status } from "./status";
import { User } from "./user";

export class Appointment {
    id?: number;
    status?: Status;
    doctor?: User;
    parent?: User;
    annotations?: any;
    dateStart?: Date;
    dateEnd?: Date;
    place?: String;
}
