import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentStatus } from 'src/interfaces/appointments';
import { Repository } from 'typeorm';
import { MeetingRecommendation } from './domain/meeting-recommendation.domain';
import { MeetingRecommendationEntity } from './entities/meeting-recommendation.entity';

@Injectable()
export class MeetingRecommendationRepository {
  constructor(
    @InjectRepository(MeetingRecommendationEntity)
    private meetingRecommendationRepository: Repository<MeetingRecommendationEntity>,
  ) {}

  async saveMeetingRecommendation(
    meetingRecommendation: MeetingRecommendation,
  ): Promise<MeetingRecommendation> {
    await this.meetingRecommendationRepository.save(
      MeetingRecommendationEntity.from(meetingRecommendation),
    );
    return meetingRecommendation;
  }

  async findLastCompletedMeeting(
    fromUserId: string,
    toUserId: string,
  ): Promise<MeetingRecommendation> {
    return await this.findMeetingRecommendationsByFromAndToUserId(
      fromUserId,
      toUserId,
      1,
      AppointmentStatus.COMPLETED,
    )[0];
  }

  async findCurrentMeetingRecommendations(
    fromUserId: string,
    toUserId: string,
    limit: number,
  ): Promise<MeetingRecommendation[]> {
    return await this.findMeetingRecommendationsByFromAndToUserId(
      fromUserId,
      toUserId,
      limit,
      AppointmentStatus.PENDING,
    );
  }

  private async findMeetingRecommendationsByFromAndToUserId(
    fromUserId: string,
    toUserId: string,
    limit: number,
    status: AppointmentStatus,
  ): Promise<MeetingRecommendation[]> {
    const entities = await this.meetingRecommendationRepository.find({
      relations: [
        'userRelation',
        'userRelation.fromUser',
        'userRelation.toUser',
      ],
      where: {
        userRelation: {
          fromUser: { id: fromUserId },
          toUser: { id: toUserId },
        },
        status,
      },
      order: { startDateTime: 'DESC' }, // latest first
      take: limit,
    });

    return entities.map((entity) => entity.toMeetingRecommendation());
  }
}
