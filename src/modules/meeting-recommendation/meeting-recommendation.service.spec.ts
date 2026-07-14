import { DateTime, Settings } from 'luxon';
import { AppointmentStatus } from 'src/interfaces/appointments';
import { MeetingRecommendationService } from './meeting-recommendation.service';
import { MeetingRecommendationRepository } from './meeting-recommendation.repository';
import { UserService } from '../users/services/user.service';
import { ScheduleService } from '../calendar/schedule.service';
import { NotificationService } from '../notification/notification.service';
import { MeetingRecommendation } from './domain/meeting-recommendation.domain';

describe('MeetingRecommendationService', () => {
  let service: MeetingRecommendationService;
  let meetingRecommendationRepository: jest.Mocked<MeetingRecommendationRepository>;
  let userService: jest.Mocked<UserService>;
  let scheduleService: jest.Mocked<ScheduleService>;
  let notificationService: jest.Mocked<NotificationService>;

  const mentorId = 'mentor-1';
  const menteeId = 'mentee-1';
  const fixedNow = DateTime.fromObject({ year: 2026, month: 6, day: 15 });
  const originalSettingsNow = Settings.now;

  beforeEach(() => {
    Settings.now = () => fixedNow.toMillis();

    meetingRecommendationRepository = {
      completeAllPendingMeetings: jest.fn(),
      findCurrentMeetingRecommendations: jest.fn().mockResolvedValue([]),
      findRejectedMeetingRecommendations: jest.fn().mockResolvedValue([]),
      findLastCompletedMeeting: jest.fn(),
      saveMeetingRecommendations: jest.fn(),
      findMeetingRecommendationById: jest.fn(),
      updateMeetingRecommendationStatus: jest.fn(),
    } as unknown as jest.Mocked<MeetingRecommendationRepository>;

    userService = {
      getAllMentors: jest.fn(),
      getMenteesForMentor: jest.fn(),
      getUserRelation: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    scheduleService = {
      syncLatestCalendarEvents: jest.fn(),
      findFreeSlotsInSchedule: jest.fn(),
    } as unknown as jest.Mocked<ScheduleService>;

    notificationService = {
      sendNotification: jest.fn(),
    } as unknown as jest.Mocked<NotificationService>;

    service = new MeetingRecommendationService(
      meetingRecommendationRepository,
      userService,
      scheduleService,
      notificationService,
    );
  });

  afterEach(() => {
    Settings.now = originalSettingsNow;
    jest.clearAllMocks();
  });

  describe('ensureMeetingsComplete', () => {
    it('marks all overdue pending meetings across all mentors as completed', async () => {
      await service.ensureMeetingsComplete();

      expect(
        meetingRecommendationRepository.completeAllPendingMeetings,
      ).toHaveBeenCalledWith();
    });
  });

  describe('completeMeetingsForMentor', () => {
    it('marks overdue pending meetings as completed for a single mentor', async () => {
      await service.completeMeetingsForMentor(mentorId);

      expect(
        meetingRecommendationRepository.completeAllPendingMeetings,
      ).toHaveBeenCalledWith(mentorId);
    });
  });

  describe('checkForMeetingsToRecommend', () => {
    beforeEach(() => {
      userService.getAllMentors.mockResolvedValue([{ id: mentorId }] as any);
      userService.getMenteesForMentor.mockResolvedValue([
        { id: menteeId },
      ] as any);
      scheduleService.findFreeSlotsInSchedule.mockResolvedValue([
        {
          startDateTime: fixedNow.plus({ days: 1 }),
          endDateTime: fixedNow.plus({ days: 1, hours: 1 }),
        },
      ] as any);
      userService.getUserRelation.mockResolvedValue({ id: 'relation-1' } as any);
    });

    it('recommends a meeting when the mentee has never had a completed meeting', async () => {
      meetingRecommendationRepository.findLastCompletedMeeting.mockResolvedValue(
        undefined,
      );

      await service.checkForMeetingsToRecommend();

      expect(scheduleService.findFreeSlotsInSchedule).toHaveBeenCalled();
      expect(
        meetingRecommendationRepository.saveMeetingRecommendations,
      ).toHaveBeenCalled();
    });

    it('recommends a meeting when the last completed meeting was over a month ago', async () => {
      meetingRecommendationRepository.findLastCompletedMeeting.mockResolvedValue(
        {
          endDateTime: fixedNow.minus({ months: 2 }),
        } as any,
      );

      await service.checkForMeetingsToRecommend();

      expect(scheduleService.findFreeSlotsInSchedule).toHaveBeenCalled();
    });

    it('does not recommend a meeting when the last completed meeting was less than a month ago', async () => {
      meetingRecommendationRepository.findLastCompletedMeeting.mockResolvedValue(
        {
          endDateTime: fixedNow.minus({ days: 5 }),
        } as any,
      );

      await service.checkForMeetingsToRecommend();

      expect(scheduleService.findFreeSlotsInSchedule).not.toHaveBeenCalled();
    });

    it('skips mentees that already have an open meeting recommendation', async () => {
      meetingRecommendationRepository.findCurrentMeetingRecommendations.mockResolvedValue(
        [{ toUserId: menteeId } as any],
      );

      await service.checkForMeetingsToRecommend();

      expect(
        meetingRecommendationRepository.findLastCompletedMeeting,
      ).not.toHaveBeenCalled();
      expect(scheduleService.findFreeSlotsInSchedule).not.toHaveBeenCalled();
    });
  });

  describe('recommendMeetings', () => {
    beforeEach(() => {
      userService.getUserRelation.mockResolvedValue({ id: 'relation-1' } as any);
    });

    it('syncs both calendars, finds a free slot, persists the recommendation, and notifies the mentor', async () => {
      const freeSlot = {
        startDateTime: fixedNow.plus({ days: 2, hours: 9 }),
        endDateTime: fixedNow.plus({ days: 2, hours: 10 }),
      };
      scheduleService.findFreeSlotsInSchedule.mockResolvedValue([
        freeSlot,
      ] as any);

      await service.recommendMeetings(mentorId, menteeId);

      expect(scheduleService.syncLatestCalendarEvents).toHaveBeenCalledWith(
        mentorId,
      );
      expect(scheduleService.syncLatestCalendarEvents).toHaveBeenCalledWith(
        menteeId,
      );
      expect(
        meetingRecommendationRepository.saveMeetingRecommendations,
      ).toHaveBeenCalledWith(
        'relation-1',
        expect.arrayContaining([
          expect.objectContaining({
            fromUserId: mentorId,
            toUserId: menteeId,
            status: AppointmentStatus.PENDING,
          }),
        ]),
      );
      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        mentorId,
        'Meeting Recommendation',
        expect.stringContaining(menteeId),
      );
    });

    it('sends a plural notification message when multiple slots are recommended', async () => {
      scheduleService.findFreeSlotsInSchedule.mockResolvedValue([
        {
          startDateTime: fixedNow.plus({ days: 2 }),
          endDateTime: fixedNow.plus({ days: 2, hours: 1 }),
        },
        {
          startDateTime: fixedNow.plus({ days: 3 }),
          endDateTime: fixedNow.plus({ days: 3, hours: 1 }),
        },
      ] as any);

      await service.recommendMeetings(mentorId, menteeId);

      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        mentorId,
        'Meeting Recommendation',
        `You have new meeting recommendations with ${menteeId}`,
      );
    });
  });

  describe('declineMeetingRecommendation', () => {
    it('marks the recommendation as rejected when it belongs to the mentor', async () => {
      meetingRecommendationRepository.findMeetingRecommendationById.mockResolvedValue(
        { id: 'rec-1', fromUserId: mentorId } as any,
      );

      await service.declineMeetingRecommendation(mentorId, 'rec-1');

      expect(
        meetingRecommendationRepository.updateMeetingRecommendationStatus,
      ).toHaveBeenCalledWith('rec-1', AppointmentStatus.REJECTED);
    });

    it('throws and does not update the status when the recommendation belongs to a different mentor', async () => {
      meetingRecommendationRepository.findMeetingRecommendationById.mockResolvedValue(
        { id: 'rec-1', fromUserId: 'someone-else' } as any,
      );

      await expect(
        service.declineMeetingRecommendation(mentorId, 'rec-1'),
      ).rejects.toThrow();
      expect(
        meetingRecommendationRepository.updateMeetingRecommendationStatus,
      ).not.toHaveBeenCalled();
    });

    it('throws when the recommendation cannot be found', async () => {
      meetingRecommendationRepository.findMeetingRecommendationById.mockRejectedValue(
        new Error('not found'),
      );

      await expect(
        service.declineMeetingRecommendation(mentorId, 'missing-rec'),
      ).rejects.toThrow();
      expect(
        meetingRecommendationRepository.updateMeetingRecommendationStatus,
      ).not.toHaveBeenCalled();
    });
  });

  describe('updateMeetingRecommendation', () => {
    it('saves the meeting recommendation with the new status under the mentor-mentee relation', async () => {
      userService.getUserRelation.mockResolvedValue({ id: 'relation-1' } as any);
      const meetingRecommendation = new MeetingRecommendation({
        id: 'rec-1',
        fromUserId: mentorId,
        toUserId: menteeId,
        startDateTime: fixedNow,
        endDateTime: fixedNow.plus({ hours: 1 }),
        status: AppointmentStatus.PENDING,
      });

      await service.updateMeetingRecommendation(
        mentorId,
        menteeId,
        meetingRecommendation,
        AppointmentStatus.COMPLETED,
      );

      expect(
        meetingRecommendationRepository.saveMeetingRecommendations,
      ).toHaveBeenCalledWith('relation-1', [
        expect.objectContaining({
          id: 'rec-1',
          status: AppointmentStatus.COMPLETED,
        }),
      ]);
    });
  });
});
