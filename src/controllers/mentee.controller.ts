// controllers/mentee.controller.ts
import { Body, Controller, Delete, Get, Logger, Param, Post } from '@nestjs/common';
import { NoteService } from 'src/modules/users/note.service';
import { MenteeService } from '../services/mentee.service';


@Controller('mentee')
export class MenteeController {
  constructor(private readonly menteeService: MenteeService, private readonly noteService: NoteService) {}

  @Post('add-existing-mentee/:mentorId/:menteeId') // Define route parameters in the URL
  addMentee(
    @Param('mentorId') mentorId: string, // Extract mentorId from URL
    @Param('menteeId') menteeId: string, // Extract menteeId from URL
  ) {
    Logger.log('MenteeController Reached');
    return this.menteeService.addMentee(mentorId, menteeId);
  }
  /*
    //Use this to test postman post request:

    http://localhost:3000/mentee/add-existing-mentee/mentor-1/mentee-2
  */

  @Post('add-new-mentee/:mentorId') // Define route parameters in the URL
  addNewMentee(
    @Param('mentorId') mentorId: string, // Extract mentorId from URL
    @Body() menteeData: { name: string; birthday: string }
  ) {
    Logger.log('Adding New Mentee Controller Reached');
    return this.menteeService.addNewMentee(mentorId, menteeData.name, menteeData.birthday);
  }

  @Delete('delete/:mentorId/:menteeId')
  deleteMentee(
    @Param('mentorId') mentorId: string,
    @Param('menteeId') menteeId: string,
  ) {
    Logger.log('Delete Mentee Controller Reached');
    this.noteService.deleteAllNotes(mentorId, menteeId);
    return this.menteeService.deleteMentee(mentorId, menteeId);
  }

  @Get('list/:mentorId')
  listAllMentees(
    @Param('mentorId') mentorId: string,
  ) {
    Logger.log('List All Mentees Controller Reached');
    return this.menteeService.getAllMentees(mentorId);
  }

//   // Create an appointment
//   @Post(':menteeId/appointments/:mentorId')
//   createAppointment(
//     @Param('menteeId') menteeId: string,
//     @Param('mentorId') mentorId: string,
//     @Body() body: { startDateTime: Date; endDateTime: Date }
//   ): Appointment {
//     return this.menteeService.createAppointment(menteeId, mentorId, new Date(body.startDateTime), new Date(body.endDateTime));
//   }
//
//   // Get all appointments for a mentee
//   @Get(':menteeId/appointments')
//   getAppointments(@Param('menteeId') menteeId: string): Appointment[] {
//     return this.menteeService.getAppointmentsByMentee(menteeId);
//   }
//
//   // Update an appointment's status
//   @Put(':mentorId/appointments/:menteeId')
//   updateAppointment(
//     @Param('mentorId') mentorId: string,
//     @Param('menteeId') menteeId: string,
//     @Body() body: { status: AppointmentStatus }
//   ): Appointment {
//     return this.menteeService.updateAppointment(mentorId, menteeId, body.status);
//   }
//
//   // Delete an appointment
//   @Delete(':mentorId/appointments/:menteeId')
//   deleteAppointment(
//     @Param('mentorId') mentorId: string,
//     @Param('menteeId') menteeId: string
//   ): boolean {
//     return this.menteeService.deleteAppointment(mentorId, menteeId);
//   }
}
