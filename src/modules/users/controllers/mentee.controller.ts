// controllers/mentee.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { NoteService } from 'src/modules/users/services/note.service';
import { CreateMenteeDto } from '../dto/mentee.dto';
import { UserService } from '../services/user.service';

@Controller('mentee')
export class MenteeController {
  constructor(
    private readonly userService: UserService,
    private readonly noteService: NoteService,
  ) {}

  @Post('add-existing-mentee/:mentorId/:menteeId') // Define route parameters in the URL
  async addMentee(
    @Param('mentorId') mentorId: string, // Extract mentorId from URL
    @Param('menteeId') menteeId: string, // Extract menteeId from URL
  ) {
    Logger.log('MenteeController Reached');
    return this.userService.attachMenteeToMentorLegacy(mentorId, menteeId);
  }
  /*
    //Use this to test postman post request:

    http://localhost:3000/mentee/add-existing-mentee/mentor-1/mentee-2
  */

  @Post('add-new-mentee/:mentorId') // Define route parameters in the URL
  async addNewMentee(
    @Param('mentorId') mentorId: string, // Extract mentorId from URL
    @Body() menteeData: CreateMenteeDto,
  ) {
    Logger.log('Adding New Mentee Controller Reached');
    return this.userService.createNewMentee(
      mentorId,
      menteeData.name,
      new Date(menteeData.birthdate),
      menteeData.email,
    );
  }

  @Delete('delete/:mentorId/:menteeId')
  async deleteMentee(
    @Param('mentorId') mentorId: string,
    @Param('menteeId') menteeId: string,
  ) {
    Logger.log('Delete Mentee Controller Reached');
    this.noteService.deleteAllNotes(mentorId, menteeId);
    return this.userService.deleteMenteeLegacy(mentorId, menteeId);
  }

  @Get('list/legacy/:mentorId')
  async listAllMenteesLegacy(@Param('mentorId') mentorId: string) {
    Logger.log('List All Mentees Controller Reached');
    return this.userService.getAllMenteesLegacy(mentorId);
  }

  @Get('list/:mentorId/')
  async listAllMentees(@Param('mentorId') mentorId: string) {
    return this.userService.getMenteesForMentor(mentorId);
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
