import { Injectable } from '@nestjs/common';

@Injectable()
export class NotesService {
  // async getNotes(mentorId: string, menteeId: string): Promise<Prayer[]> {
  //   if (prayerDb[mentorId] && prayerDb[mentorId][menteeId])
  //     return prayerDb[mentorId][menteeId];
  //   else {
  //     return;
  //   }
  // }
  // async createNote(mentorId: string, menteeId: string, content: string) {
  //   if (prayerDb[mentorId] && prayerDb[mentorId][menteeId]) {
  //     prayerDb[mentorId][menteeId].push(new Prayer(content, new Date()));
  //     return prayerDb[mentorId][menteeId];
  //   }
  //   return;
  // }
  // async editNote(
  //   mentorId: string,
  //   menteeId: string,
  //   noteId: string,
  //   content: string,
  // ) {
  //   if (prayerDb[mentorId] && prayerDb[mentorId][menteeId]) {
  //     const note = prayerDb[mentorId][menteeId].find(
  //       (item) => item.id === noteId,
  //     );
  //     if (note !== null && note !== undefined) {
  //       note.content = content;
  //       return note;
  //     }
  //   }
  //   return;
  // }
  // async deleteNote(mentorId: string, menteeId: string, id: string) {
  //   const indexToRemove: number = prayerDb[mentorId][menteeId].findIndex(
  //     (note) => note.id === id,
  //   );
  //   if (indexToRemove !== -1) {
  //     prayerDb[mentorId][menteeId].splice(indexToRemove, 1);
  //   }
  //   return prayerDb[mentorId][menteeId];
  // }
  // async deleteAllNotes(mentorId: string, menteeId: string) {
  //   if (prayerDb[mentorId] && prayerDb[mentorId][menteeId])
  //     delete prayerDb[mentorId][menteeId];
  //   return prayerDb;
  // }
}
