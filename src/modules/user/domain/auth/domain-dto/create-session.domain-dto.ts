/*Domain DTO для создания пользовательской сессии.*/
export class CreateSessionDomainDTO {
  userId: string;
  deviceId: string;
  iat: Date;
  exp: Date;
}
