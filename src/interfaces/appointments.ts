export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export type Appointment = {
  id: string;
  status: AppointmentStatus;
  menteeId: string;
  mentorId: string;
  startDateTime: Date;
  endDateTime: Date;
};
