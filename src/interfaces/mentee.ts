export class Mentee {
  id: string;
  name: string;
  birthday: Date;

  constructor(
    id: string,
    name: string,
    birthday: Date,
  ) {
    this.id = id;
    this.name = name;
    this.birthday = birthday;
  }
};