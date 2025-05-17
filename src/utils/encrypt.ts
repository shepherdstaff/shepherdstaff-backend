import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

export const encryptText = async (textToEncrypt: string) => {
  const iv = randomBytes(16);
  const password = process.env.ENCRYPTION_KEY;

  // The key length is dependent on the algorithm.
  // In this case for aes256, it is 32 bytes.
  const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
  const cipher = createCipheriv('aes-256-ctr', key, iv);

  const encryptedText = Buffer.concat([
    cipher.update(textToEncrypt),
    cipher.final(),
  ]);

  return encryptedText.toString();
};
