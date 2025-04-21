import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = 10;
  return bcrypt.hash(password, salt);
};

export const compareInputPasswordWithHash = async (
  inputPassword: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(inputPassword, hash);
};
