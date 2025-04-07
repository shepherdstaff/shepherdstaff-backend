import { PreferenceFieldName } from './preference-field-names.enum';

export const DEFAULT_PREFERENCES = {
  [PreferenceFieldName.SCHEDULE_SLOT_LENGTH]: 60, // in minutes
  [PreferenceFieldName.RECOMMENDATIONS_AT_ONCE]: 1,
  [PreferenceFieldName.MEETING_FREQUENCY]: 1, // in months
};
