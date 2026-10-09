import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/user.validation-constraints';
import { User } from '../users/users.entity';
import { CreatePasswordRecoveryCodeDataDomainDTO } from './domain-dto/create-password-recovery-code-data.domain-dto';
import { UpdatePasswordRecoveryCodeDataDomainDTO } from './domain-dto/update-password-recovery-code-data.domain-dto';

/*Класс для сущности данных о коде восстановления пароля пользователя.*/
@Entity({ name: 'password_recovery_codes_data', schema: 'public' })
export class PasswordRecoveryCodeData {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  public id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  public userId: string;

  @Column({
    name: 'password_recovery_code',
    type: 'varchar',
    length: USER_VALIDATION_CONSTRAINTS.PASSWORD_RECOVERY_CODE.MAX_LENGTH,
    nullable: false,
  })
  public passwordRecoveryCode: string;

  @Column({ name: 'expiration_date', type: 'timestamp', nullable: false })
  public expirationDate: Date;

  @ManyToOne((): typeof User => User, (user: User): PasswordRecoveryCodeDataList => user.passwordRecoveryCodes, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  public user: User;

  public static create(dto: CreatePasswordRecoveryCodeDataDomainDTO): PasswordRecoveryCodeData {
    const passwordRecoveryCodeData: PasswordRecoveryCodeData = new PasswordRecoveryCodeData();
    passwordRecoveryCodeData.userId = dto.userId;
    passwordRecoveryCodeData.passwordRecoveryCode = dto.passwordRecoveryCode;
    passwordRecoveryCodeData.expirationDate = dto.expirationDate;
    return passwordRecoveryCodeData;
  }

  public update(dto: UpdatePasswordRecoveryCodeDataDomainDTO): void {
    this.passwordRecoveryCode = dto.passwordRecoveryCode;
    this.expirationDate = dto.expirationDate;
  }
}

/*Domain DTO для списка сущностей данных о кодах восстановления паролей пользователей.*/
export type PasswordRecoveryCodeDataList = PasswordRecoveryCodeData[];
