/*Domain DTO для изменения данных о подтверждении регистрации пользователя.*/
export class UpdateEmailConfirmationDomainDTO {
  confirmationCode: string;
  expirationDate: Date;
}
