/*Domain DTO для создания данных о подтверждении регистрации пользователя.*/
export class CreateEmailConfirmationDomainDTO {
  userId: string;
  confirmationCode: string;
  expirationDate: Date;
}
