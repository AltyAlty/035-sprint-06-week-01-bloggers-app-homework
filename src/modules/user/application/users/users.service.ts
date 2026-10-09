import { Injectable } from '@nestjs/common';
import { Argon2Adapter } from '../../../../core/security/cryptography/argon2.adapter';
import { CommentsRepository } from '../../../blog/infrastructure/comments/comments.repository';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { UserOutputDTO } from '../../api/users/output-dto/user.output-dto';
import { normalizeEmail } from '../../../../core/utils/email/normalize-email.util';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { User } from '../../domain/users/users.entity';
import { CreateUserDTO } from './dto/create-user.dto';

/*Сервис для пользователей.*/
@Injectable()
export class UsersService {
  public constructor(
    private readonly argon2Adapter: Argon2Adapter,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository
  ) {}

  /*Метод для создания пользователя.*/
  public async create(dto: CreateUserDTO): Promise<string | UserOutputDTO> {
    /*Получаем логин пользователя.*/
    const login: string = dto.login;
    /*Получаем email пользователя.*/
    const email: string = dto.email;
    /*Получаем флаг, обозначающий нужно ли создавать уже подтвержденного пользователя или нет.*/
    const isConfirmed: boolean | undefined = dto.isConfirmed;
    /*Просим репозиторий "UsersRepository" найти пользователя по логину в БД.*/
    let user: User | null = await this.usersRepository.findByLogin(login);

    /*Если пользователь был найден, то выбрасываем исключение с информацией об этом.*/
    if (user)
      throw new DomainException({
        code: DomainExceptionCode.NotUniqueLoginToCreateUser,
        message: 'Login must be unique',
        field: 'login',
      });

    /*Просим репозиторий "UsersRepository" найти пользователя по email в БД.*/
    user = await this.usersRepository.findByEmail(email);

    /*Если пользователь был найден, то выбрасываем исключение с информацией об этом.*/
    if (user)
      throw new DomainException({
        code: DomainExceptionCode.NotUniqueEmailToCreateUser,
        message: 'Email must be unique',
        field: 'email',
      });

    /*Если пользователь еще не был создан, то просим адаптер "Argon2Adapter" сгенерировать хеш для пароля.*/
    const passwordHash: string = await this.argon2Adapter.generatePasswordHash(dto.password);
    /*Просим сущность "User" создать пользователя.*/
    user = User.create({ login, originalEmail: email, email: normalizeEmail(email), passwordHash, isConfirmed });
    /*Просим репозиторий "UsersRepository" сохранить пользователя в БД.*/
    await this.usersRepository.save(user);
    /*Если нужно создать подтвержденного пользователя, то преобразовываем пользователя из БД в подготовленного для
    отправки клиенту пользователя и возвращаем его, иначе возвращаем ID созданного пользователя.*/
    if (isConfirmed) return UserOutputDTO.mapFromUserToUserOutputDTO(user);
    return user.id;
  }

  /*Метод для soft удаления пользователя по ID.*/
  public async markAsDeletedById(id: string): Promise<void> {
    /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
    const user: User | null = await this.usersRepository.findById(id);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhileDeleting,
        message: 'User to delete not found',
        field: 'code',
      });

    /*Если пользователь был найден, то просим репозиторий "UsersRepository" soft удалить пользователя по ID в БД.*/
    await this.usersRepository.markAsDeletedById(id);
    /*Просим репозиторий "CommentsRepository" soft удалить данные о лайках комментариев по ID пользователя в БД.*/
    await this.commentsRepository.markAllCommentLikeDataAsDeletedByUserId(id);
    /*Просим репозиторий "CommentsRepository" soft удалить комментарии по ID пользователя в БД.*/
    await this.commentsRepository.markAllAsDeletedByUserId(id);
  }

  /*Метод для hard удаления пользователя по ID.*/
  public async deleteById(id: string): Promise<void> {
    /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
    const user: User | null = await this.usersRepository.findById(id);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhileDeleting,
        message: 'User to delete not found',
        field: 'code',
      });

    /*Если пользователь был найден, то просим репозиторий "UsersRepository" hard удалить пользователя по ID в БД.*/
    await this.usersRepository.deleteById(id);
    /*Просим репозиторий "CommentsRepository" hard удалить данные о лайках комментариев по ID пользователя в БД.*/
    await this.commentsRepository.deleteAllCommentLikeDataByUserId(id);
    /*Просим репозиторий "CommentsRepository" hard удалить комментарии по ID пользователя в БД.*/
    await this.commentsRepository.deleteAllByUserId(id);
  }
}
