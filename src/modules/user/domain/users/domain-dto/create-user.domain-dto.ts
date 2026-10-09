/*Domain DTO для создания пользователя.*/
export class CreateUserDomainDTO {
  public login: string;
  public originalEmail: string;
  public email: string;
  public passwordHash: string;
  public isConfirmed?: boolean;
}
