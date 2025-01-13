import { AppointmentStatus } from './appointments';

// deprecated - name has been changed to distinguish between this old class and the new CalendarEvent class that
// we have defined as a proper domain object
export class CalendarEventHacked {
  isFullDay: boolean;
  startDateTime: Date;
  endDateTime: Date;
  isAppointment: boolean;
  appointmentStatus: AppointmentStatus.PENDING | null;

  constructor(
    isFullDay: boolean,
    startDateTime: Date,
    endDateTime: Date,
    appointmentStatus?: AppointmentStatus.PENDING | null,
  ) {
    this.isFullDay = isFullDay;
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
    this.appointmentStatus = appointmentStatus;
  }
}

export type RecommendedAvailabilities = {
  [menteeId: string]: Date;
};
