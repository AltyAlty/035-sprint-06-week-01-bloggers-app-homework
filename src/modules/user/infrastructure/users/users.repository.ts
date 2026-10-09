import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { normalizeEmail } from '../../../../core/utils/email/normalize-email.util';
import { User } from '../../domain/users/users.entity';

/*Репозиторий для пользователей.*/
@Injectable()
export class UsersRepository {
  public constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  /*Метод для сохранения пользователя в БД.*/
  public async save(user: User): Promise<void> {
    await this.usersRepository.save(user);
  }

  /*Метод для поиска пользователя по ID в БД.*/
  public async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  /*Метод для поиска пользователя по логину в БД.*/
  public async findByLogin(login: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { login: ILike(login) } });
  }

  /*Метод для поиска пользователя по email в БД.*/
  public async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail: string = normalizeEmail(email);
    return this.usersRepository.findOne({ where: { email: ILike(normalizedEmail) } });
  }

  /*Метод для поиска пользователя по логину или email в БД.*/
  public async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const normalizedEmail: string = normalizeEmail(loginOrEmail);
    return this.usersRepository.findOne({ where: [{ email: ILike(normalizedEmail) }, { login: ILike(loginOrEmail) }] });
  }

  /*Метод для soft удаления пользователя по ID в БД.*/
  public async markAsDeletedById(id: string): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  /*Метод для hard удаления пользователя по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
