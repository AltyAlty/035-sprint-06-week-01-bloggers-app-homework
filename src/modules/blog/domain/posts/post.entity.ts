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
import { POST_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/post.validation-constraints';
import { Blog } from '../blogs/blog.entity';
import { Comment, type CommentList } from '../comments/comment.entity';
import { CommentLikeData, type CommentLikeDataList } from '../comments/comment-like-data.entity';
import { CreatePostDomainDTO } from './domain-dto/create-post.domain-dto';
import { UpdatePostDomainDTO } from './domain-dto/update-post.domain-dto';
import { UpdatePostLikesCountDomainDTO } from './domain-dto/update-post-likes-count.domain-dto';
import { PostLikeData, type PostLikeDataList } from './post-like-data.entity';

/*Класс для сущности поста.*/
@Entity({ name: 'posts', schema: 'public' })
@Check(`"likes_count" >= 0`)
@Check(`"dislikes_count" >= 0`)
export class Post {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  public id: string;

  @Column({ name: 'blog_id', type: 'uuid', nullable: false })
  public blogId: string;

  @Column({
    name: 'title',
    type: 'varchar',
    length: POST_VALIDATION_CONSTRAINTS.TITLE.MAX_LENGTH,
    nullable: false,
    collation: 'C',
  })
  public title: string;

  @Column({
    name: 'short_description',
    type: 'varchar',
    length: POST_VALIDATION_CONSTRAINTS.SHORT_DESCRIPTION.MAX_LENGTH,
    nullable: false,
    collation: 'C',
  })
  public shortDescription: string;

  @Column({
    name: 'content',
    type: 'varchar',
    length: POST_VALIDATION_CONSTRAINTS.CONTENT.MAX_LENGTH,
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

  @OneToMany((): typeof PostLikeData => PostLikeData, (postLikeData: PostLikeData): Post => postLikeData.post)
  public postLikesData: PostLikeDataList;

  @OneToMany((): typeof Comment => Comment, (comment: Comment): Post => comment.post)
  public comments: CommentList;

  @OneToMany(
    (): typeof CommentLikeData => CommentLikeData,
    (commentLikeData: CommentLikeData): Post => commentLikeData.post
  )
  public commentLikesData: CommentLikeDataList;

  @ManyToOne((): typeof Blog => Blog, { nullable: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'blog_id', referencedColumnName: 'id' })
  public blog: Blog;

  public static create(dto: CreatePostDomainDTO): Post {
    const post: Post = new Post();
    post.blogId = dto.blogId;
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    return post;
  }

  public update(dto: UpdatePostDomainDTO): void {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }

  public updateLikesCount(dto: UpdatePostLikesCountDomainDTO): void {
    this.likesCount += dto.likesCount;
    this.dislikesCount += dto.dislikesCount;
  }
}

/*Domain DTO для списка сущностей постов.*/
export type PostList = Post[];
