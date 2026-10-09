import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/user.validation-constraints';
import { User } from '../users/users.entity';
import { CreateEmailConfirmationDomainDTO } from './domain-dto/create-email-confirmation.domain-dto';
import { UpdateEmailConfirmationDomainDTO } from './domain-dto/update-email-confirmation.domain-dto';

/*Класс для сущности данных о подтверждении регистрации пользователя.*/
@Entity({ name: 'email_confirmations', schema: 'public' })
export class EmailConfirmation {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  public id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  public userId: string;

  @Column({
    name: 'confirmation_code',
    type: 'varchar',
    length: USER_VALIDATION_CONSTRAINTS.CONFIRMATION_REGISTRATION_CODE.MAX_LENGTH,
    nullable: false,
  })
  public confirmationCode: string;

  @Column({ name: 'expiration_date', type: 'timestamp', nullable: false })
  public expirationDate: Date;

  @ManyToOne((): typeof User => User, (user: User): EmailConfirmationList => user.emailConfirmations, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  public user: User;

  public static create(dto: CreateEmailConfirmationDomainDTO): EmailConfirmation {
    const emailConfirmation: EmailConfirmation = new EmailConfirmation();
    emailConfirmation.userId = dto.userId;
    emailConfirmation.confirmationCode = dto.confirmationCode;
    emailConfirmation.expirationDate = dto.expirationDate;
    return emailConfirmation;
  }

  public update(dto: UpdateEmailConfirmationDomainDTO): void {
    this.confirmationCode = dto.confirmationCode;
    this.expirationDate = dto.expirationDate;
  }
}

/*Domain DTO для списка сущностей данных о подтверждениях регистраций пользователей.*/
export type EmailConfirmationList = EmailConfirmation[];
