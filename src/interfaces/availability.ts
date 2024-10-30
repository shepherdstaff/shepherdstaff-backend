import { AppointmentStatus } from './appointments';

export class CalendarEvent {
  isFullDay: boolean;
  startDateTime: Date;
  endDateTime: Date;
  isAppointment: boolean;
  appointmentStatus: AppointmentStatus.CONFIRMED | AppointmentStatus.PENDING;

  constructor(
    isFullDay: boolean,
    startDateTime: Date,
    endDateTime: Date,
    appointmentStatus?: AppointmentStatus.CONFIRMED | AppointmentStatus.PENDING,
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
