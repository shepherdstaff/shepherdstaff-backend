import { Request } from 'express';
import { UserPayload } from 'src/modules/auth/interfaces/user-payload';

export function retrieveUserInfoFromRequest(req: Request): UserPayload {
  return req['user'];
}
