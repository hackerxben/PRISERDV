export class User {
    id?: number;
    firstName?: string;
    lastName?: string;
    login?: string;
    password?: string;
    // extra fields for parent
    childName?: string;
    // extra fields for doctor
    speciality?: string;
    description?: string;
}
