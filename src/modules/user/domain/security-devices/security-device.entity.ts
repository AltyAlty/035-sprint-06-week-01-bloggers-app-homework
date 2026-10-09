import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { SECURITY_DEVICE_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/security-device.validation-constraints';
import { Session, type SessionList } from '../auth/session.entity';
import { User } from '../users/users.entity';
import { CreateSecurityDeviceDomainDTO } from './domain-dto/create-security-device.domain-dto';
import { UpdateSecurityDeviceDomainDTO } from './domain-dto/update-security-device.domain-dto';

/*Класс для сущности пользовательского устройства.*/
@Entity({ name: 'security_devices', schema: 'public' })
export class SecurityDevice {
  @PrimaryColumn('uuid', { name: 'device_id' })
  public deviceId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  public userId: string;

  @Column({
    name: 'title',
    type: 'varchar',
    length: SECURITY_DEVICE_VALIDATION_CONSTRAINTS.TITLE.MAX_LENGTH,
    nullable: false,
  })
  public title: string;

  @Column({
    name: 'ip',
    type: 'varchar',
    length: SECURITY_DEVICE_VALIDATION_CONSTRAINTS.IP.MAX_LENGTH,
    nullable: false,
  })
  public ip: string;

  @Column({ name: 'last_active_date', type: 'timestamp', nullable: false })
  public lastActiveDate: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: (): string => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;

  @OneToMany((): typeof Session => Session, (session: Session): SecurityDevice => session.device)
  public sessions: SessionList;

  @ManyToOne((): typeof User => User, (user: User): SecurityDeviceList => user.securityDevices, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  public user: User;

  public static create(dto: CreateSecurityDeviceDomainDTO): SecurityDevice {
    const securityDevice: SecurityDevice = new SecurityDevice();
    securityDevice.deviceId = dto.deviceId;
    securityDevice.userId = dto.userId;
    securityDevice.title = dto.title;
    securityDevice.ip = dto.ip;
    securityDevice.lastActiveDate = dto.lastActiveDate;
    return securityDevice;
  }

  public update(dto: UpdateSecurityDeviceDomainDTO): void {
    this.title = dto.title;
    this.ip = dto.ip;
    this.lastActiveDate = dto.lastActiveDate;
  }
}

/*Domain DTO для списка сущностей пользовательских устройств.*/
export type SecurityDeviceList = SecurityDevice[];
