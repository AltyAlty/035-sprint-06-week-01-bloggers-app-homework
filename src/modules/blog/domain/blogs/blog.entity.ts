import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BLOG_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/blog.validation-constraints';
import { Comment, type CommentList } from '../comments/comment.entity';
import { CommentLikeData, type CommentLikeDataList } from '../comments/comment-like-data.entity';
import { Post, type PostList } from '../posts/post.entity';
import { PostLikeData, type PostLikeDataList } from '../posts/post-like-data.entity';
import { CreateBlogDomainDTO } from './domain-dto/create-blog.domain-dto';
import { UpdateBlogDomainDTO } from './domain-dto/update-blog.domain-dto';

/*Класс для сущности блога.*/
@Entity({ name: 'blogs', schema: 'public' })
export class Blog {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  public id: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: BLOG_VALIDATION_CONSTRAINTS.NAME.MAX_LENGTH,
    nullable: false,
    collation: 'C',
  })
  public name: string;

  @Column({
    name: 'description',
    type: 'varchar',
    length: BLOG_VALIDATION_CONSTRAINTS.DESCRIPTION.MAX_LENGTH,
    nullable: false,
    collation: 'C',
  })
  public description: string;

  @Column({
    name: 'website_url',
    type: 'varchar',
    length: BLOG_VALIDATION_CONSTRAINTS.WEBSITE_URL.MAX_LENGTH,
    nullable: false,
    collation: 'C',
  })
  public websiteUrl: string;

  @Column({ name: 'is_membership', type: 'boolean', nullable: false, default: false })
  public isMembership: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: (): string => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true, default: null })
  public deletedAt: Date | null;

  @OneToMany((): typeof Post => Post, (post: Post): Blog => post.blog)
  public posts: PostList;

  @OneToMany((): typeof PostLikeData => PostLikeData, (postLikeData: PostLikeData): Blog => postLikeData.blog)
  public postLikesData: PostLikeDataList;

  @OneToMany((): typeof Comment => Comment, (comment: Comment): Blog => comment.blog)
  public comments: CommentList;

  @OneToMany(
    (): typeof CommentLikeData => CommentLikeData,
    (commentLikeData: CommentLikeData): Blog => commentLikeData.blog
  )
  public commentLikesData: CommentLikeDataList;

  public static create(dto: CreateBlogDomainDTO): Blog {
    const blog: Blog = new Blog();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    return blog;
  }

  public update(dto: UpdateBlogDomainDTO): void {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}

/*Domain DTO для списка сущностей блогов.*/
export type BlogList = Blog[];
