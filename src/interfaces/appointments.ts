export enum AppointmentStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
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
