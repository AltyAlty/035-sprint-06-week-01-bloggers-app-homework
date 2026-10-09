/*Domain DTO для создания данных о коде восстановления пароля пользователя.*/
export class CreatePasswordRecoveryCodeDataDomainDTO {
  userId: string;
  passwordRecoveryCode: string;
  expirationDate: Date;
}
