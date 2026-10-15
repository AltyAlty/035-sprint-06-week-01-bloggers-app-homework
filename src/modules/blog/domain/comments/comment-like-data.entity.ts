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
import { COMMENT_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/comment.validation-constraints';
import { User } from '../../../user/domain/users/users.entity';
import { Blog } from '../blogs/blog.entity';
import { Post } from '../posts/post.entity';
import { Comment } from './comment.entity';
import { CommentLikeStatusDomainDTO } from './domain-dto/comment-like-status.domain-dto';
import { CreateCommentLikeDataDomainDTO } from './domain-dto/create-comment-like-data.domain-dto';
import { UpdateCommentLikeDataDomainDTO } from './domain-dto/update-comment-like-data.domain-dto';

/*Класс для сущности данных о лайке комментария.*/
@Entity({ name: 'comment_likes_data', schema: 'public' })
@Check(`"like_status" IN ('Like', 'Dislike')`)
@Unique('UQ_comment_user', ['commentId', 'userId'])
export class CommentLikeData {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  public id: string;

  @Column({ name: 'blog_id', type: 'uuid', nullable: false })
  public blogId: string;

  @Column({ name: 'post_id', type: 'uuid', nullable: false })
  public postId: string;

  @Column({ name: 'comment_id', type: 'uuid', nullable: false })
  public commentId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  public userId: string;

  @Column({
    name: 'like_status',
    type: 'varchar',
    length: COMMENT_VALIDATION_CONSTRAINTS.LIKE_STATUS.MAX_LENGTH,
    nullable: false,
  })
  public likeStatus: CommentLikeStatusDomainDTO;

  @CreateDateColumn({
    name: 'added_at',
    type: 'timestamp',
    nullable: false,
    default: (): string => 'CURRENT_TIMESTAMP',
  })
  public addedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true, default: null })
  public deletedAt: Date | null;

  @ManyToOne((): typeof Blog => Blog, (blog: Blog): CommentLikeDataList => blog.commentLikesData, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'blog_id', referencedColumnName: 'id' })
  public blog: Blog;

  @ManyToOne((): typeof Post => Post, (post: Post): CommentLikeDataList => post.commentLikesData, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  public post: Post;

  @ManyToOne((): typeof Comment => Comment, (comment: Comment): CommentLikeDataList => comment.commentLikesData, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'comment_id', referencedColumnName: 'id' })
  public comment: Comment;

  @ManyToOne((): typeof User => User, (user: User): CommentLikeDataList => user.commentLikesData, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  public user: User;

  public static create(dto: CreateCommentLikeDataDomainDTO): CommentLikeData {
    const commentLikeData: CommentLikeData = new CommentLikeData();
    commentLikeData.blogId = dto.blogId;
    commentLikeData.postId = dto.postId;
    commentLikeData.commentId = dto.commentId;
    commentLikeData.userId = dto.userId;
    commentLikeData.likeStatus = dto.likeStatus;
    return commentLikeData;
  }

  public update(dto: UpdateCommentLikeDataDomainDTO): void {
    this.likeStatus = dto.likeStatus;
    this.addedAt = new Date();
  }
}

/*Domain DTO для списка сущностей данных о лайках комментариев.*/
export type CommentLikeDataList = CommentLikeData[];
