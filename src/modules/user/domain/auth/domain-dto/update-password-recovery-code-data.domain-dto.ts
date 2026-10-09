/*Domain DTO для изменения данных о коде восстановления пароля пользователя.*/
export class UpdatePasswordRecoveryCodeDataDomainDTO {
  passwordRecoveryCode: string;
  expirationDate: Date;
}
