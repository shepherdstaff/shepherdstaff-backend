import { RoleEnum } from '../constants/roles';

export class User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  birthdate: Date;
  createdAt: Date;

  constructor(props?: Partial<User>) {
    if (props) Object.assign(this, props);
  }

  getRole(): RoleEnum {
    return RoleEnum.UNDEFINED;
  }
}
