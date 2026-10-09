import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { COMMENT_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/comment.validation-constraints';
import { User } from '../../../user/domain/users/users.entity';
import { Blog } from '../blogs/blog.entity';
import { Post } from '../posts/post.entity';
import { CommentLikeData, type CommentLikeDataList } from './comment-like-data.entity';
import { CreateCommentDomainDTO } from './domain-dto/create-comment.domain-dto';
import { UpdateCommentDomainDTO } from './domain-dto/update-comment.domain-dto';
import { UpdateCommentLikesCountDomainDTO } from './domain-dto/update-comment-likes-count.domain-dto';

/*Класс для сущности комментария.*/
@Entity({ name: 'comments', schema: 'public' })
@Check(`"likes_count" >= 0`)
@Check(`"dislikes_count" >= 0`)
export class Comment {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  public id: string;

  @Column({ name: 'blog_id', type: 'uuid', nullable: false })
  public blogId: string;

  @Column({ name: 'post_id', type: 'uuid', nullable: false })
  public postId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  public userId: string;

  @Column({
    name: 'content',
    type: 'varchar',
    length: COMMENT_VALIDATION_CONSTRAINTS.CONTENT.MAX_LENGTH,
    nullable: false,
    collation: 'C',
  })
  public content: string;

  @Column({ name: 'likes_count', type: 'integer', nullable: false, default: 0 })
  public likesCount: number;

  @Column({ name: 'dislikes_count', type: 'integer', nullable: false, default: 0 })
  public dislikesCount: number;

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
    (): typeof CommentLikeData => CommentLikeData,
    (commentLikeData: CommentLikeData): Comment => commentLikeData.comment
  )
  public commentLikesData: CommentLikeDataList;

  @ManyToOne((): typeof Blog => Blog, (blog: Blog): CommentList => blog.comments, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'blog_id', referencedColumnName: 'id' })
  public blog: Blog;

  @ManyToOne((): typeof Post => Post, (post: Post): CommentList => post.comments, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  public post: Post;

  @ManyToOne((): typeof User => User, (user: User): CommentList => user.comments, {
    nullable: false,
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  public user: User;

  public static create(dto: CreateCommentDomainDTO): Comment {
    const comment: Comment = new Comment();
    comment.blogId = dto.blogId;
    comment.postId = dto.postId;
    comment.userId = dto.userId;
    comment.content = dto.content;
    return comment;
  }

  public update(dto: UpdateCommentDomainDTO): void {
    this.content = dto.content;
  }

  public updateLikesCount(dto: UpdateCommentLikesCountDomainDTO): void {
    this.likesCount += dto.likesCount;
    this.dislikesCount += dto.dislikesCount;
  }
}

/*Domain DTO для списка сущностей комментариев.*/
export type CommentList = Comment[];
