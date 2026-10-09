/*Domain DTO для создания пользовательского устройства.*/
export class CreateSecurityDeviceDomainDTO {
  deviceId: string;
  userId: string;
  title: string;
  ip: string;
  lastActiveDate: Date;
}
