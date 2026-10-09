import { ApiProperty } from '@nestjs/swagger';
import { User, UserList } from '../../../domain/users/users.entity';

/*Output DTO для пользователя.*/
export class UserOutputDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID' })
  public id: string;

  @ApiProperty({ example: 'userLogin', description: 'User login' })
  public login: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  public email: string;

  @ApiProperty({ example: '2026-08-28T04:16:49.315Z', description: 'User registration date' })
  public createdAt: Date;

  /*Маппер для преобразования пользователя из БД в подготовленного для отправки клиенту пользователя.*/
  public static mapFromUserToUserOutputDTO(user: User): UserOutputDTO {
    const userOutputDTO: UserOutputDTO = new UserOutputDTO();
    userOutputDTO.id = user.id.toString();
    userOutputDTO.login = user.login;
    userOutputDTO.email = user.originalEmail;
    userOutputDTO.createdAt = user.createdAt;
    return userOutputDTO;
  }

  /*Маппер для преобразования пользователей из БД в подготовленных для отправки клиенту пользователей.*/
  public static mapFromUserListToUserListOutputDTO(users: UserList): UserListOutputDTO {
    return users.map((user: User) => this.mapFromUserToUserOutputDTO(user));
  }
}

/*Output DTO для списка пользователей.*/
export type UserListOutputDTO = UserOutputDTO[];
