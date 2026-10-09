import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsController } from './api/blogs/blogs.controller';
import { BlogsSaController } from './api/blogs/blogs-sa.controller';
import { CommentsController } from './api/comments/comments.controller';
import { PostsController } from './api/posts/posts.controller';
import { BlogsService } from './application/blogs/blogs.service';
import { CommentsService } from './application/comments/comments.service';
import { PostsService } from './application/posts/posts.service';
import { BlogsQueryService } from './application/blogs/blogs.query-service';
import { CommentsQueryService } from './application/comments/comments.query-service';
import { PostsQueryService } from './application/posts/posts.query-service';
import { BlogsRepository } from './infrastructure/blogs/blogs.repository';
import { CommentsRepository } from './infrastructure/comments/comments.repository';
import { PostsRepository } from './infrastructure/posts/posts.repository';
import { BlogsQueryRepository } from './infrastructure/blogs/blogs.query-repository';
import { CommentsQueryRepository } from './infrastructure/comments/comments.query-repository';
import { PostsQueryRepository } from './infrastructure/posts/posts.query-repository';
import { UserModule } from '../user/user.module';
import { Blog } from './domain/blogs/blog.entity';
import { Comment } from './domain/comments/comment.entity';
import { CommentLikeData } from './domain/comments/comment-like-data.entity';
import { Post } from './domain/posts/post.entity';
import { PostLikeData } from './domain/posts/post-like-data.entity';

/*Модуль для блогов, постов и комментариев.*/
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'access-jwt' }),
    UserModule,
    TypeOrmModule.forFeature([Blog, Post, PostLikeData, Comment, CommentLikeData]),
  ],
  controllers: [BlogsController, BlogsSaController, PostsController, CommentsController],
  providers: [
    BlogsService,
    PostsService,
    CommentsService,
    BlogsQueryService,
    PostsQueryService,
    CommentsQueryService,
    BlogsRepository,
    PostsRepository,
    CommentsRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
  ],
})
export class BlogModule {}
