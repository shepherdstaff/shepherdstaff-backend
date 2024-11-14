// services/mentee.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { menteeDb, mentorToMenteeMapDb } from '../../../hacked-database';
import { Mentee } from '../domain/mentee';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class MenteeService {
  constructor(@Inject() private usersRepository: UsersRepository) {}

  async attachMenteeToMentor(mentorId: string, menteeId: string) {
    // Check if mentee already exists
    if (mentorToMenteeMapDb[mentorId] == null) {
      Logger.warn('MentorId not found, add a mentor first.');
    }
    if (mentorToMenteeMapDb[mentorId].includes(menteeId)) {
      Logger.warn(' Mentee already exist for this Mentor.');
    }

    // Add mentee's events to the mentorToMenteeMapDb
    mentorToMenteeMapDb[mentorId].push(menteeId);
    Logger.log(
      `Added new mentee to mentorToMenteeMapDb - ${mentorId} - ${menteeId}`,
    );
  }

  async createNewMentee(
    mentorId: string,
    name: string,
    birthdate: Date,
    email: string,
  ) {
    // if (mentorToMenteeMapDb[mentorId] == null) {
    //   throw new Error('MentorId not found, add a mentor first.');
    // }
    // let isPresentInMenteeDb = false;
    // let existingMenteeId = '';
    // // Iterate over all keys (mentee IDs) in menteeDb
    // for (const menteeId in menteeDb) {
    //   const menteeName = menteeDb[menteeId][0]; // Destructure to get the mentee's name
    //   if (menteeName === name) {
    //     existingMenteeId = menteeId;
    //     isPresentInMenteeDb = true;
    //   }
    // }
    // const newBirthday = new Date(birthday);
    // const newMenteeId =
    //   existingMenteeId == '' ? this.generateNewMenteeId() : existingMenteeId;
    // const newMentee = new Mentee(newMenteeId, name, newBirthday);
    // this.attachMenteeToMentor(mentorId, newMenteeId);
    // menteeDb[newMenteeId] = [name, newBirthday];
    // Logger.log(
    //   `Added new mentee to menteeDb - ${newMenteeId}, ${name}, ${newBirthday.toLocaleDateString()}`,
    // );
    const newMentee = new Mentee({ name, birthdate, email });

    const createdMenteeEntity =
      await this.usersRepository.createUser(newMentee);
    newMentee.id = createdMenteeEntity.id;

    await this.usersRepository.setMenteeForMentorUser(
      mentorId,
      createdMenteeEntity.id,
    );

    return newMentee;
  }

  generateNewMenteeId(): string {
    const newIndex = Object.keys(menteeDb).length + 1;
    return 'mentee-' + newIndex;
  }

  deleteMentee(mentorId: string, menteeId: string) {
    // Check if mentee already exists
    if (mentorToMenteeMapDb[mentorId] == null) {
      Logger.warn('MentorId not found, add a mentor first.');
    }

    const menteeList = mentorToMenteeMapDb[mentorId];
    const menteeIndex = menteeList.findIndex((id) => id === menteeId);
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
      return {
        mentorId,
        mentees: [],
        message: `No mentees found for mentor ${mentorId}`,
      }; // Empty array
    }
  }
}
