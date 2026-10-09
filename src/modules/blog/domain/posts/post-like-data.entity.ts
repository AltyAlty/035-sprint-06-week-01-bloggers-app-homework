import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { POST_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/post.validation-constraints';
import { User } from '../../../user/domain/users/users.entity';
import { Blog } from '../blogs/blog.entity';
import { CreatePostLikeDataDomainDTO } from './domain-dto/create-post-like-data.domain-dto';
import { PostLikeStatusDomainDTO } from './domain-dto/post-like-status.domain-dto';
import { UpdatePostLikeDataDomainDTO } from './domain-dto/update-post-like-data.domain-dto';
import { Post } from './post.entity';

/*Класс для сущности данных о лайке поста.*/
@Entity({ name: 'post_likes_data', schema: 'public' })
@Check(`"like_status" IN ('Like', 'Dislike')`)
@Unique('UQ_post_user', ['postId', 'userId'])
export class PostLikeData {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  public id: string;

  @Column({ name: 'blog_id', type: 'uuid', nullable: false })
  public blogId: string;

  @Column({ name: 'post_id', type: 'uuid', nullable: false })
  public postId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  public userId: string;

  @Column({
    name: 'like_status',
    type: 'varchar',
    length: POST_VALIDATION_CONSTRAINTS.LIKE_STATUS.MAX_LENGTH,
    nullable: false,
  })
  public likeStatus: PostLikeStatusDomainDTO;

  @CreateDateColumn({
    name: 'added_at',
    type: 'timestamp',
    nullable: false,
    default: (): string => 'CURRENT_TIMESTAMP',
  })
  public addedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true, default: null })
  public deletedAt: Date | null;

  @ManyToOne((): typeof Blog => Blog, (blog: Blog): PostLikeDataList => blog.postLikesData, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'blog_id', referencedColumnName: 'id' })
  public blog: Blog;

  @ManyToOne((): typeof Post => Post, (post: Post): PostLikeDataList => post.postLikesData, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  public post: Post;

  @ManyToOne((): typeof User => User, (user: User): PostLikeDataList => user.postLikesData, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  public user: User;

  public static create(dto: CreatePostLikeDataDomainDTO): PostLikeData {
    const postLikeData: PostLikeData = new PostLikeData();
    postLikeData.blogId = dto.blogId;
    postLikeData.postId = dto.postId;
    postLikeData.userId = dto.userId;
    postLikeData.likeStatus = dto.likeStatus;
    return postLikeData;
  }

  public update(dto: UpdatePostLikeDataDomainDTO): void {
    this.likeStatus = dto.likeStatus;
  }
}

/*Domain DTO для списка сущностей данных о лайках постов.*/
export type PostLikeDataList = PostLikeData[];
