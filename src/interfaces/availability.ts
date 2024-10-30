import { AppointmentStatus } from './appointments';

export class CalendarEvent {
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
