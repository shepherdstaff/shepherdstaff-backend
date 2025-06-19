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

  async completeAllPendingMeetings(userId?: string): Promise<void> {
    if (userId) {
      await this.meetingRecommendationRepository.update(
        {
          status: AppointmentStatus.PENDING,
          startDateTime: LessThanOrEqual(new Date()),
          userRelation: { fromUser: { id: userId } },
        },
        { status: AppointmentStatus.COMPLETED },
      );
      return;
    }

    await this.meetingRecommendationRepository.update(
      {
        status: AppointmentStatus.PENDING,
        startDateTime: LessThanOrEqual(new Date()),
      },
      { status: AppointmentStatus.COMPLETED },
    );
  }

  async updateMeetingRecommendationStatus(
    meetingRecommendationId: string,
    status: AppointmentStatus,
  ) {
    await this.meetingRecommendationRepository.update(
      { id: meetingRecommendationId },
      { status },
    );
  }

  async findMeetingRecommendationById(
    meetingRecommendationId: string,
  ): Promise<MeetingRecommendation> {
    const entity = await this.meetingRecommendationRepository.findOneOrFail({
      where: { id: meetingRecommendationId },
      relations: [
        'userRelation',
        'userRelation.fromUser',
        'userRelation.toUser',
      ],
    });
    return entity.toMeetingRecommendation();
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
      userWhereOptions = { fromUser: { id: fromUserId } };
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
          ...(noEarlierThan && { endDateTime: MoreThanOrEqual(noEarlierThan) }),
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
          ...(noEarlierThan && { endDateTime: MoreThanOrEqual(noEarlierThan) }),
        },
        order: { startDateTime: 'DESC' }, // latest first
        take: limit,
      });
    }

    return entities.map((entity) => entity.toMeetingRecommendation());
  }
}
