export class Preferences {
  constructor(props: Partial<Preferences>) {
    if (props) Object.assign(this, props);
  }

  fields: { [preferencesFieldName: string]: string | boolean };
}
