import { DateTime } from 'luxon';
import { CalendarEvent } from './calendar-event.domain';

/**
 * Google Calendar Event Interface
 * https://developers.google.com/calendar/api/v3/reference/events#resource
 */
export class GoogleCalendarEvent {
  constructor(props?: Partial<GoogleCalendarEvent>) {
    if (props) Object.assign(this, props);
  }

  kind: string; // 'calendar#event';
  etag: string;
  id: string;
  status: string;
  htmlLink: string;
  created: string; // date-time string
  updated: string; // date-time string
  summary: string;
  description: string;
  location: string;
  colorId: string;
  creator: {
    id?: string;
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  organizer: {
    id?: string;
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  start: {
    date?: string; // yyyy-mm-dd
    dateTime?: string; // RFC3339 datetime string, example: 2023-10-05T14:48:00Z
    timeZone?: string; // IANA Time Zone Database name
  };
  end: {
    date?: string; // yyyy-mm-dd
    dateTime?: string; // RFC3339 datetime string, example: 2023-10-05T14:48:00Z
    timeZone?: string; // IANA Time Zone Database name
  };
  endTimeUnspecified: boolean;
  recurrence: string[];
  recurringEventId: string;
  originalStartTime: {
    date?: string; // yyyy-mm-dd
    dateTime?: string; // RFC3339 datetime string, example: 2023-10-05T14:48:00Z
    timeZone?: string; // IANA Time Zone Database name
  };
  transparency: string;
  visibility: string;
  iCalUID: string;
  sequence: number;
  attendees?: {
    id?: string;
    email?: string;
    displayName?: string;
    organizer?: boolean;
    self?: boolean;
    resource?: boolean;
    optional?: boolean;
    responseStatus?: string;
    comment?: string;
    additionalGuests?: number;
  }[];
  attendeesOmitted: boolean;
  extendedProperties: any;
  hangoutLink: string;
  conferenceData: any;
  gadget: any;
  anyoneCanAddSelf: boolean;
  guestsCanInviteOthers: boolean;
  guestsCanModify: boolean;
  guestsCanSeeOtherGuests: boolean;
  privateCopy: boolean;
  locked: boolean;
  reminders: any;
  source: any;
  workingLocationProperties: any;
  outOfOfficeProperties: any;
  focusTimeProperties: any;
  attachments: any[];
  birthdayProperties: {
    contact: string;
    type: string;
    customTypeName: string;
  };
  eventType: string;

  toCalendarEventDomain(): CalendarEvent {
    return {
      name: this.summary,
      sourceId: this.id,
      id: undefined,
      startDateTime: DateTime.fromISO(this.start.date || this.start.dateTime),
      endDateTime: DateTime.fromISO(this.end.date || this.end.dateTime),
      hasTimings: !this.start.date,
      calendarId: this.organizer.email,
    };
  }
}
