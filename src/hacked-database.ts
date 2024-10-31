import { Appointment } from './interfaces/appointments';
import { CalendarEvent } from './interfaces/availability';
import { Prayer } from './interfaces/notes';
import {
  mockPrayerRequest1,
  mockPrayerRequest2,
  mockPrayerRequest3,
} from './mock-prayer-requests';

export const mockMentee1Id = 'mentee-1';
export const mockMentee2Id = 'mentee-2';
export const mockMentee3Id = 'mentee-3';
export const mockMentee4Id = 'mentee-4';
export const mockMentee5Id = 'mentee-5';

export const mockMentorId = 'mentor-1';

export const mockMenteeName = 'John';
export const mockMenteeBirthday = '2008-07-12T00:00:00.000Z';

const mockEventsMentor = [
  {
    isFullDay: true,
    startDateTime: '2024-10-30T00:00:00.000Z',
    endDateTime: '2024-10-30T23:59:59.000Z',
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
    endDateTime: '2025-02-01T23:59:59.000Z',
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
    endDateTime: '2025-06-14T23:59:59.000Z',
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

const mockEventsMentee2 = [
  {
    isFullDay: true,
    startDateTime: '2024-11-15T00:00:00.000Z',
    endDateTime: '2024-11-17T00:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2024-12-10T10:30:00.000Z',
    endDateTime: '2024-12-10T15:45:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2025-01-02T00:00:00.000Z',
    endDateTime: '2025-01-02T23:59:59.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2025-02-14T09:00:00.000Z',
    endDateTime: '2025-02-14T17:30:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2025-03-20T00:00:00.000Z',
    endDateTime: '2025-03-23T00:00:00.000Z',
  },
];

const mockEventsMentee3 = [
  {
    isFullDay: false,
    startDateTime: '2024-12-05T14:00:00.000Z',
    endDateTime: '2024-12-05T19:00:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2025-01-10T00:00:00.000Z',
    endDateTime: '2025-01-12T00:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2025-02-22T11:15:00.000Z',
    endDateTime: '2025-02-22T16:30:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2025-04-05T00:00:00.000Z',
    endDateTime: '2025-04-05T23:59:59.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2025-05-18T08:45:00.000Z',
    endDateTime: '2025-05-18T12:15:00.000Z',
  },
];

const mockEventsMentee4 = [
  {
    isFullDay: true,
    startDateTime: '2024-10-30T00:00:00.000Z',
    endDateTime: '2024-11-01T00:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2024-12-15T16:30:00.000Z',
    endDateTime: '2024-12-15T20:45:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2025-02-01T00:00:00.000Z',
    endDateTime: '2025-02-03T00:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2025-03-10T13:00:00.000Z',
    endDateTime: '2025-03-10T18:30:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2025-05-15T00:00:00.000Z',
    endDateTime: '2025-05-17T00:00:00.000Z',
  },
];

const mockEventsMentee5 = [
  {
    isFullDay: false,
    startDateTime: '2024-11-20T09:45:00.000Z',
    endDateTime: '2024-11-20T14:15:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2024-12-25T00:00:00.000Z',
    endDateTime: '2024-12-27T00:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2025-01-15T15:30:00.000Z',
    endDateTime: '2025-01-15T20:00:00.000Z',
  },
  {
    isFullDay: true,
    startDateTime: '2025-03-01T00:00:00.000Z',
    endDateTime: '2025-03-03T00:00:00.000Z',
  },
  {
    isFullDay: false,
    startDateTime: '2025-04-20T10:00:00.000Z',
    endDateTime: '2025-04-20T15:30:00.000Z',
  },
];

const mockPrayers = [
  {
    content: mockPrayerRequest1,
    date: '2024-04-14T00:00:00.000Z',
  },
  {
    content: mockPrayerRequest2,
    date: '2024-07-12T00:00:00.000Z',
  },
  {
    content: mockPrayerRequest3,
    date: '2024-06-11T00:00:00.000Z',
  },
  {
    content: 'A very long and detailed prayer request.',
    date: '2024-07-13T00:00:00.000Z',
  },
  {
    content: 'A very long and detailed prayer request.',
    date: '2024-08-10T00:00:00.000Z',
  },
];

export const prayerDb: {
  [mentorId: string]: {
    [menteeId: string]: Prayer[];
  };
} = {
  [mockMentorId]: {
    [mockMentee1Id]: [
      new Prayer(mockPrayers[0].content, new Date(mockPrayers[0].date)),
    ],
    [mockMentee2Id]: [
      new Prayer(mockPrayers[1].content, new Date(mockPrayers[1].date)),
    ],
    [mockMentee3Id]: [
      new Prayer(mockPrayers[2].content, new Date(mockPrayers[2].date)),
    ],
    [mockMentee4Id]: [
      new Prayer(mockPrayers[3].content, new Date(mockPrayers[3].date)),
    ],
    [mockMentee5Id]: [
      new Prayer(mockPrayers[4].content, new Date(mockPrayers[4].date)),
    ],
  },
};

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

const mockEventsToCalendarEvents = (events: any[]) => {
  return events.map(
    (event) =>
      new CalendarEvent(
        event.isFullDay,
        new Date(event.startDateTime),
        new Date(event.endDateTime),
      ),
  );
};

export const menteeAvailabilityDb: { [menteeId: string]: CalendarEvent[] } = {
  [mockMentee1Id]: mockEventsToCalendarEvents(mockEventsMentee),
  [mockMentee2Id]: mockEventsToCalendarEvents(mockEventsMentee2),
  [mockMentee3Id]: mockEventsToCalendarEvents(mockEventsMentee3),
  [mockMentee4Id]: mockEventsToCalendarEvents(mockEventsMentee4),
  [mockMentee5Id]: mockEventsToCalendarEvents(mockEventsMentee5),
};

export const appointmentsDb: {
  [mentorId: string]: {
    [menteeId: string]: Appointment;
  };
} = {
  [mockMentorId]: {},
};

export const mentorToMenteeMapDb: { [mentorId: string]: string[] } = {
  [mockMentorId]: [
    mockMentee1Id,
    mockMentee2Id,
    mockMentee3Id,
    mockMentee4Id,
    mockMentee5Id,
  ],
};

export const menteeDb: { [menteeId: string]: (string | Date)[] } = {
  [mockMentee1Id]: [mockMenteeName, new Date(mockMenteeBirthday)],
  [mockMentee2Id]: ['Jane', new Date('2005-05-12T00:00:00.000Z')],
  [mockMentee3Id]: ['Alice', new Date('2007-09-30T00:00:00.000Z')],
  [mockMentee4Id]: ['Bob', new Date('2006-01-15T00:00:00.000Z')],
  [mockMentee5Id]: ['Charlie', new Date('2009-03-25T00:00:00.000Z')],
};
