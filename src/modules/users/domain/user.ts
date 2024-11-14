import { RoleEnum } from '../constants/roles';

export abstract class User {
  id: string;
  name: string;
  email: string;
  birthdate: Date;

  constructor(props?: Partial<User>) {
    if (props) Object.assign(this, props);
  }

  abstract getRole(): RoleEnum;
}
