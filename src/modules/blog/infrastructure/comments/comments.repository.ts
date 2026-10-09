import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../domain/comments/comment.entity';
import { CommentLikeData } from '../../domain/comments/comment-like-data.entity';

/*Репозиторий для комментариев в PostgreSQL.*/
@Injectable()
export class CommentsRepository {
  public constructor(
    @InjectRepository(Comment) private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(CommentLikeData) private readonly commentLikesDataRepository: Repository<CommentLikeData>
  ) {}

  /*Метод для сохранения комментария в БД.*/
  public async save(comment: Comment): Promise<void> {
    await this.commentsRepository.save(comment);
  }

  /*Метод для сохранения данных о лайке комментария в БД.*/
  public async saveCommentLikeData(commentLikeData: CommentLikeData): Promise<void> {
    await this.commentLikesDataRepository.save(commentLikeData);
  }

  /*Метод для поиска комментария по ID в БД.*/
  public async findById(id: string): Promise<Comment | null> {
    return this.commentsRepository.findOneBy({ id });
  }

  /*Метод для поиска данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async findCommentLikeDataByCommentIdAndUserId(
    commentId: string,
    userId: string
  ): Promise<CommentLikeData | null> {
    return this.commentLikesDataRepository.findOneBy({ commentId, userId });
  }

  /*Метод для soft удаления комментария по ID в БД.*/
  public async markAsDeletedById(id: string): Promise<void> {
    await this.commentsRepository.softDelete(id);
  }

  /*Метод для hard удаления комментария по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.commentsRepository.delete(id);
  }

  /*Метод для soft удаления комментариев по ID поста в БД.*/
  public async markAllAsDeletedByPostId(postId: string): Promise<void> {
    await this.commentsRepository.softDelete({ postId });
  }

  /*Метод для hard удаления комментариев по ID поста в БД.*/
  public async deleteAllByPostId(postId: string): Promise<void> {
    await this.commentsRepository.delete({ postId });
  }

  /*Метод для soft удаления комментариев по ID блога в БД.*/
  public async markAllAsDeletedByBlogId(blogId: string): Promise<void> {
    await this.commentsRepository.softDelete({ blogId });
  }

  /*Метод для hard удаления комментариев по ID блога в БД.*/
  public async deleteAllByBlogId(blogId: string): Promise<void> {
    await this.commentsRepository.delete({ blogId });
  }

  /*Метод для soft удаления комментариев по ID пользователя в БД.*/
  public async markAllAsDeletedByUserId(userId: string): Promise<void> {
    await this.commentsRepository.softDelete({ userId });
  }

  /*Метод для hard удаления комментариев по ID пользователя в БД.*/
  public async deleteAllByUserId(userId: string): Promise<void> {
    await this.commentsRepository.delete({ userId });
  }

  /*Метод для soft удаления данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async markCommentLikeDataAsDeletedByCommentIdAndUserId(commentId: string, userId: string): Promise<void> {
    await this.commentLikesDataRepository.softDelete({ commentId, userId });
  }

  /*Метод для hard удаления данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async deleteCommentLikeDataByCommentIdAndUserId(commentId: string, userId: string): Promise<void> {
    await this.commentLikesDataRepository.delete({ commentId, userId });
  }

  /*Метод для soft удаления данных о лайках комментария по ID комментария в БД.*/
  public async markAllCommentLikeDataAsDeletedByCommentId(commentId: string): Promise<void> {
    await this.commentLikesDataRepository.softDelete({ commentId });
  }

  /*Метод для hard удаления данных о лайках комментария по ID комментария в БД.*/
  public async deleteAllCommentLikeDataByCommentId(commentId: string): Promise<void> {
    await this.commentLikesDataRepository.delete({ commentId });
  }

  /*Метод для soft удаления данных о лайках комментариев по ID поста в БД.*/
  public async markAllCommentLikeDataAsDeletedByPostId(postId: string): Promise<void> {
    await this.commentLikesDataRepository.softDelete({ postId });
  }

  /*Метод для hard удаления данных о лайках комментариев по ID поста в БД.*/
  public async deleteAllCommentLikeDataByPostId(postId: string): Promise<void> {
    await this.commentLikesDataRepository.delete({ postId });
  }

  /*Метод для soft удаления данных о лайках комментария по ID блога в БД.*/
  public async markAllCommentLikeDataAsDeletedByBlogId(blogId: string): Promise<void> {
    await this.commentLikesDataRepository.softDelete({ blogId });
  }

  /*Метод для hard удаления данных о лайках комментария по ID блога в БД.*/
  public async deleteAllCommentLikeDataByBlogId(blogId: string): Promise<void> {
    await this.commentLikesDataRepository.delete({ blogId });
  }

  /*Метод для soft удаления данных о лайках комментария по ID пользователя в БД.*/
  public async markAllCommentLikeDataAsDeletedByUserId(userId: string): Promise<void> {
    await this.commentLikesDataRepository.softDelete({ userId });
  }

  /*Метод для hard удаления данных о лайках комментария по ID пользователя в БД.*/
  public async deleteAllCommentLikeDataByUserId(userId: string): Promise<void> {
    await this.commentLikesDataRepository.delete({ userId });
  }
}
