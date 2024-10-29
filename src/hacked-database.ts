import { Appointment } from './interfaces/appointments';
import { CalendarEvent } from './interfaces/availability';

export const mockMenteeId = 'mentee-1';
export const mockMentorId = 'mentor-1';

const mockEventsMentor = [
  {
    isFullDay: true,
    startDateTime: '2024-10-30T00:00:00.000Z',
    endDateTime: '2024-10-30T00:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2024-11-05T09:00:00.000Z',
    endDateTime: '2024-11-05T17:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2024-12-01T14:30:00.000Z',
    endDateTime: '2024-12-01T16:45:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2024-12-20T00:00:00.000Z',
    endDateTime: '2024-12-22T00:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2025-01-05T08:00:00.000Z',
    endDateTime: '2025-01-05T12:00:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2025-02-01T00:00:00.000Z',
    endDateTime: '2025-02-01T00:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2025-03-15T19:00:00.000Z',
    endDateTime: '2025-03-15T21:30:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2025-04-25T00:00:00.000Z',
    endDateTime: '2025-04-27T00:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2025-05-31T23:00:00.000Z',
    endDateTime: '2025-06-01T01:00:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2025-06-14T00:00:00.000Z',
    endDateTime: '2025-06-14T00:00:00.000Z',
  },
];

const mockEventsMentee = [
  {
    isFullDay: true,
    startDateTime: '2024-11-01T00:00:00.000Z',
    endDateTime: '2024-11-03T00:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2024-12-01T08:00:00.000Z',
    endDateTime: '2024-12-01T15:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2024-12-15T15:00:00.000Z',
    endDateTime: '2024-12-15T18:00:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2025-01-18T00:00:00.000Z',
    endDateTime: '2025-01-21T00:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2025-02-05T10:00:00.000Z',
    endDateTime: '2025-02-05T14:00:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2025-03-05T00:00:00.000Z',
    endDateTime: '2025-03-05T00:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2025-04-14T20:00:00.000Z',
    endDateTime: '2025-04-15T00:00:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2025-05-22T00:00:00.000Z',
    endDateTime: '2025-05-26T00:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2025-06-30T22:00:00.000Z',
    endDateTime: '2025-07-01T02:00:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2025-07-12T00:00:00.000Z',
    endDateTime: '2025-07-14T00:00:00.000Z',
  },
];

export const mentorAvailabilityDb: { [mentorId: string]: CalendarEvent[] } = {
  [mockMentorId]: mockEventsMentor.map(
    (event) =>
      new CalendarEvent(
        event.isFullDay,
        new Date(event.startDateTime),
        new Date(event.endDateTime),
      ),
  ),
};
export const menteeAvailabilityDb: { [menteeId: string]: CalendarEvent[] } = {
  [mockMenteeId]: mockEventsMentee.map(
    (event) =>
      new CalendarEvent(
        event.isFullDay,
        new Date(event.startDateTime),
        new Date(event.endDateTime),
      ),
  ),
};

export const appointmentsDb: {
  [mentorId: string]: {
    [menteeId: string]: Appointment;
  };
} = {
  [mockMentorId]: {},
};

export const mentorToMenteeMapDb: { [mentorId: string]: string[] } = {
  [mockMentorId]: [mockMenteeId],
};
