import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { getMessaging } from 'firebase-admin/messaging';

jest.mock('firebase-admin/messaging');

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepo: jest.Mocked<NotificationRepository>;
  let sendEachForMulticast: jest.Mock;

  beforeEach(() => {
    notificationRepo = {
      getNotificationClients: jest.fn(),
      saveNotificationClient: jest.fn(),
    } as unknown as jest.Mocked<NotificationRepository>;

    sendEachForMulticast = jest.fn().mockResolvedValue({ successCount: 1 });
    (getMessaging as jest.Mock).mockReturnValue({
      sendEachForMulticast,
    });

    service = new NotificationService(notificationRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('fetches tokens for the user and sends a multicast push with them', async () => {
      notificationRepo.getNotificationClients.mockResolvedValue([
        { id: 'client-1', token: 'token-1' },
        { id: 'client-2', token: 'token-2' },
      ]);

      await service.sendNotification('user-1', 'Title', 'Body message');

      expect(notificationRepo.getNotificationClients).toHaveBeenCalledWith(
        'user-1',
      );
      expect(sendEachForMulticast).toHaveBeenCalledWith({
        notification: { title: 'Title', body: 'Body message' },
        tokens: ['token-1', 'token-2'],
      });
    });

    it('sends a multicast payload with an empty token list when the user has no registered devices', async () => {
      notificationRepo.getNotificationClients.mockResolvedValue([]);

      await service.sendNotification('user-1', 'Title', 'Body message');

      expect(sendEachForMulticast).toHaveBeenCalledWith({
        notification: { title: 'Title', body: 'Body message' },
        tokens: [],
      });
    });
  });

  describe('registerClient', () => {
    it('delegates to the repository to persist the registration token', async () => {
      await service.registerClient('user-1', 'new-registration-token');

      expect(notificationRepo.saveNotificationClient).toHaveBeenCalledWith(
        'user-1',
        'new-registration-token',
      );
    });
  });
});
