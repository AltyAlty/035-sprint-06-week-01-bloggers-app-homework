import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SecurityDevice } from '../security-devices/security-device.entity';
import { User } from '../users/users.entity';
import { CreateSessionDomainDTO } from './domain-dto/create-session.domain-dto';
import { UpdateSessionDomainDTO } from './domain-dto/update-session.domain-dto';

/*Класс для сущности пользовательской сессии.*/
@Entity({ name: 'sessions', schema: 'public' })
export class Session {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  public id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  public userId: string;

  @Column({ name: 'device_id', type: 'uuid', nullable: false })
  public deviceId: string;

  @Column({ name: 'iat', type: 'timestamp', nullable: false })
  public iat: Date;

  @Column({ name: 'exp', type: 'timestamp', nullable: false })
  public exp: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: (): string => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;

  @ManyToOne((): typeof User => User, (user: User): SessionList => user.sessions, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  public user: User;

  @ManyToOne((): typeof SecurityDevice => SecurityDevice, (device: SecurityDevice): SessionList => device.sessions, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'device_id', referencedColumnName: 'deviceId' })
  public device: SecurityDevice;

  public static create(dto: CreateSessionDomainDTO): Session {
    const session: Session = new Session();
    session.userId = dto.userId;
    session.deviceId = dto.deviceId;
    session.iat = dto.iat;
    session.exp = dto.exp;
    return session;
  }

  public update(dto: UpdateSessionDomainDTO): void {
    this.iat = dto.iat;
    this.exp = dto.exp;
  }
}

/*Domain DTO для списка сущностей пользовательских сессий.*/
export type SessionList = Session[];
