import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentStatus } from 'src/interfaces/appointments';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { MeetingRecommendation } from './domain/meeting-recommendation.domain';
import { MeetingRecommendationEntity } from './entities/meeting-recommendation.entity';

@Injectable()
export class MeetingRecommendationRepository {
  constructor(
    @InjectRepository(MeetingRecommendationEntity)
    private meetingRecommendationRepository: Repository<MeetingRecommendationEntity>,
  ) {}

  async saveMeetingRecommendations(
    userRelationId: string,
    meetingRecommendations: MeetingRecommendation[],
  ): Promise<MeetingRecommendation[]> {
    await this.meetingRecommendationRepository.save(
      meetingRecommendations.map((meetingRecommendation) =>
        MeetingRecommendationEntity.from(userRelationId, meetingRecommendation),
      ),
    );
    return meetingRecommendations;
  }

  async findLastCompletedMeeting(
    fromUserId: string,
    toUserId?: string,
  ): Promise<MeetingRecommendation> {
    return await this.findMeetingRecommendationsByFromAndToUserId(
      fromUserId,
      AppointmentStatus.COMPLETED,
      toUserId,
      1,
    )[0];
  }

  async findCurrentMeetingRecommendations(
    fromUserId: string,
    toUserId?: string,
    limit?: number,
  ): Promise<MeetingRecommendation[]> {
    return await this.findMeetingRecommendationsByFromAndToUserId(
      fromUserId,
      AppointmentStatus.PENDING,
      toUserId,
      limit,
    );
  }

  async findRejectedMeetingRecommendations(
    fromUserId: string,
    toUserId?: string,
    noEarlierThan?: Date,
  ) {
    return await this.findMeetingRecommendationsByFromAndToUserId(
      fromUserId,
      AppointmentStatus.REJECTED,
      toUserId,
      undefined,
      noEarlierThan,
    );
  }

  async completeAllPendingMeetings(): Promise<void> {
    await this.meetingRecommendationRepository.update(
      {
        status: AppointmentStatus.PENDING,
        startDateTime: LessThanOrEqual(new Date()),
      },
      { status: AppointmentStatus.COMPLETED },
    );
  }

  private async findMeetingRecommendationsByFromAndToUserId(
    fromUserId: string,
    status: AppointmentStatus,
    toUserId?: string,
    limit?: number,
    noEarlierThan?: Date,
  ): Promise<MeetingRecommendation[]> {
    let userWhereOptions;
    if (toUserId) {
      userWhereOptions = {
        fromUser: { id: fromUserId },
        toUser: { id: toUserId },
      };
    } else {
      userWhereOptions = {
        fromUser: { id: fromUserId },
      };
    }

    let entities: MeetingRecommendationEntity[];
    if (!limit) {
      entities = await this.meetingRecommendationRepository.find({
        relations: [
          'userRelation',
          'userRelation.fromUser',
          'userRelation.toUser',
        ],
        where: {
          userRelation: userWhereOptions,
          status,
          ...(noEarlierThan && {
            endDateTime: MoreThanOrEqual(noEarlierThan),
          }),
        },
        order: { startDateTime: 'DESC' }, // latest first
      });
    } else {
      entities = await this.meetingRecommendationRepository.find({
        relations: [
          'userRelation',
          'userRelation.fromUser',
          'userRelation.toUser',
        ],
        where: {
          userRelation: userWhereOptions,
          status,
          ...(noEarlierThan && {
            endDateTime: MoreThanOrEqual(noEarlierThan),
          }),
        },
        order: { startDateTime: 'DESC' }, // latest first
        take: limit,
      });
    }

    return entities.map((entity) => entity.toMeetingRecommendation());
  }
}
