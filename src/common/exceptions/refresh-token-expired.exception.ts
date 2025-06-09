export const EXPIRED_GOOGLE_OAUTH_REFRESH_TOKEN_ERROR = 'invalid_grant';

export class RefreshTokenExpiredException extends Error {
  constructor() {
    super(
      'Invalid refresh token. Please re-authenticate with Google Calendar.',
    );
    this.name = RefreshTokenExpiredException.name;
  }

  logError() {
    console.error(this.message);
  }
}
