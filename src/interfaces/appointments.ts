enum AppointmentStatus {
  PENDING,
  CONFIRMED,
  REJECTED,
  CANCELLED,
  COMPLETED,
}

export type Appointment = {
  id: string;
  status: AppointmentStatus;
  menteeId: string;
  mentorId: string;
  startDateTime: Date;
  endDateTime: Date;
};
