import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/user.validation-constraints';
import { Comment, type CommentList } from '../../../blog/domain/comments/comment.entity';
import { CommentLikeData, type CommentLikeDataList } from '../../../blog/domain/comments/comment-like-data.entity';
import { PostLikeData, type PostLikeDataList } from '../../../blog/domain/posts/post-like-data.entity';
import { EmailConfirmation, type EmailConfirmationList } from '../auth/email-confirmation.entity';
import {
  PasswordRecoveryCodeData,
  type PasswordRecoveryCodeDataList,
} from '../auth/password-recovery-code-data.entity';
import { Session, type SessionList } from '../auth/session.entity';
import { SecurityDevice, type SecurityDeviceList } from '../security-devices/security-device.entity';
import { CreateUserDomainDTO } from './domain-dto/create-user.domain-dto';

/*Класс для сущности пользователя.*/
@Entity({ name: 'users', schema: 'public' })
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  public id: string;

  @Column({
    name: 'login',
    type: 'varchar',
    length: USER_VALIDATION_CONSTRAINTS.LOGIN.MAX_LENGTH,
    nullable: false,
    unique: true,
    collation: 'C',
  })
  public login: string;

  @Column({
    name: 'original_email',
    type: 'varchar',
    length: USER_VALIDATION_CONSTRAINTS.ORIGINAL_EMAIL.MAX_LENGTH,
    nullable: false,
  })
  public originalEmail: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: USER_VALIDATION_CONSTRAINTS.EMAIL.MAX_LENGTH,
    nullable: false,
    unique: true,
    collation: 'C',
  })
  public email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: USER_VALIDATION_CONSTRAINTS.PASSWORD_HASH.MAX_LENGTH,
    nullable: false,
  })
  public passwordHash: string;

  @Column({ name: 'is_confirmed', type: 'boolean', nullable: false, default: false })
  public isConfirmed: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: (): string => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true, default: null })
  public deletedAt: Date | null;

  @OneToMany(
    (): typeof EmailConfirmation => EmailConfirmation,
    (confirmation: EmailConfirmation): User => confirmation.user
  )
  public emailConfirmations: EmailConfirmationList;

  @OneToMany(
    (): typeof PasswordRecoveryCodeData => PasswordRecoveryCodeData,
    (recoveryCode: PasswordRecoveryCodeData): User => recoveryCode.user
  )
  public passwordRecoveryCodes: PasswordRecoveryCodeDataList;

  @OneToMany((): typeof SecurityDevice => SecurityDevice, (device: SecurityDevice): User => device.user)
  public securityDevices: SecurityDeviceList;

  @OneToMany((): typeof Session => Session, (session: Session): User => session.user)
  public sessions: SessionList;

  @OneToMany((): typeof PostLikeData => PostLikeData, (postLikeData: PostLikeData): User => postLikeData.user)
  public postLikesData: PostLikeDataList;

  @OneToMany((): typeof Comment => Comment, (comment: Comment): User => comment.user)
  public comments: CommentList;

  @OneToMany(
    (): typeof CommentLikeData => CommentLikeData,
    (commentLikeData: CommentLikeData): User => commentLikeData.user
  )
  public commentLikesData: CommentLikeDataList;

  public static create(dto: CreateUserDomainDTO): User {
    const user: User = new User();
    user.login = dto.login;
    user.originalEmail = dto.originalEmail;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    if (dto.isConfirmed) user.isConfirmed = dto.isConfirmed;
    return user;
  }

  public confirm(): void {
    this.isConfirmed = true;
  }

  public updatePasswordHash(passwordHash: string): void {
    this.passwordHash = passwordHash;
  }
}

/*Domain DTO для списка сущностей пользователей.*/
export type UserList = User[];
