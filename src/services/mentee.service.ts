// services/mentee.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Appointment, AppointmentStatus } from '../interfaces/appointments';
import { mentorAvailabilityDb, menteeAvailabilityDb, appointmentsDb , mentorToMenteeMapDb} from '../hacked-database';
import { CalendarEvent } from '../interfaces/availability';


@Injectable()
export class MenteeService {
  addMentee(mentorId: string, menteeId: string) {
    // Check if mentee already exists
    if (mentorToMenteeMapDb[mentorId] == null) {
      Logger.warn('MentorId not found, add a mentor first.');
    }
    if (mentorToMenteeMapDb[mentorId].includes(menteeId)) {
      Logger.warn(' Mentee already exist for this Mentor.');
    }

    // Add mentee's events to the mentorToMenteeMapDb
    mentorToMenteeMapDb[mentorId].push(menteeId);
    Logger.log(`Added new mentee - ${mentorId} - ${menteeId}`);
  }

  deleteMentee(mentorId: string, menteeId: string) {
    // Check if mentee already exists
    if (mentorToMenteeMapDb[mentorId] == null) {
      Logger.warn('MentorId not found, add a mentor first.');
    }

    const menteeList = mentorToMenteeMapDb[mentorId];
    const menteeIndex = menteeList.findIndex(id => id === menteeId);
    if (menteeIndex !== -1) {
      menteeList.splice(menteeIndex, 1);
    }
    Logger.log(`Deleted mentee - ${mentorId} - ${menteeId}`);
  }

  getAllMentees(mentorId: string) {
    // Check if mentee already exists
    if (mentorToMenteeMapDb[mentorId] == null) {
      Logger.warn('MentorId not found, add a mentor first.');
    }

    const menteeList = mentorToMenteeMapDb[mentorId];
    if (menteeList) {
      Logger.log(`Found ${menteeList.length} mentees for mentor ${mentorId}`);
      return { mentorId, mentees: menteeList }; // Return mentorId and mentees in JSON format
    } else {
      Logger.warn(`No mentees found for mentor ${mentorId}`);
      return { mentorId, mentees: [], message: `No mentees found for mentor ${mentorId}` }; // Empty array
    }
  }


//   // Create a new appointment
//   createAppointment(menteeId: string, mentorId: string, startDateTime: Date, endDateTime: Date): Appointment {
//     const id = `${menteeId}-${mentorId}-${Date.now()}`; // Simple ID generation
//     const appointment: Appointment = {
//       id,
//       status: AppointmentStatus.PENDING,
//       menteeId,
//       mentorId,
//       startDateTime,
//       endDateTime,
//     };
//
//     // Save appointment in appointmentsDb
//     if (!appointmentsDb[mentorId]) {
//       appointmentsDb[mentorId] = {};
//     }
//     appointmentsDb[mentorId][menteeId] = appointment;
//
//     return appointment;
//   }
//
//   // Read all appointments for a specific mentee
//   getAppointmentsByMentee(menteeId: string): Appointment[] {
//     return Object.values(appointmentsDb).flatMap(mentorAppointments =>
//       Object.values(mentorAppointments).filter(appointment => appointment.menteeId === menteeId)
//     );
//   }
//
//   // Update an appointment's status
//   updateAppointment(mentorId: string, menteeId: string, status: AppointmentStatus): Appointment | null {
//     const appointment = appointmentsDb[mentorId]?.[menteeId];
//     if (appointment) {
//       appointment.status = status;
//       return appointment;
//     }
//     return null; // Appointment not found
//   }
//
//   // Delete an appointment
//   deleteAppointment(mentorId: string, menteeId: string): boolean {
//     if (appointmentsDb[mentorId]?.[menteeId]) {
//       delete appointmentsDb[mentorId][menteeId];
//       return true; // Successfully deleted
//     }
//     return false; // Appointment not found
//   }
}
