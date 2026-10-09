import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../domain/posts/post.entity';
import { PostLikeData } from '../../domain/posts/post-like-data.entity';

/*Репозиторий для постов.*/
@Injectable()
export class PostsRepository {
  public constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @InjectRepository(PostLikeData) private postLikesDataRepository: Repository<PostLikeData>
  ) {}

  /*Метод для сохранения поста в БД.*/
  public async save(post: Post): Promise<void> {
    await this.postsRepository.save(post);
  }

  /*Метод для сохранения данных о лайке поста в БД.*/
  public async savePostLikeData(postLikeData: PostLikeData): Promise<void> {
    await this.postLikesDataRepository.save(postLikeData);
  }

  /*Метод для поиска поста по ID в БД.*/
  public async findById(id: string): Promise<Post | null> {
    return this.postsRepository.findOneBy({ id });
  }

  /*Метод для поиска данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async findPostLikeDataByPostIdAndUserId(postId: string, userId: string): Promise<PostLikeData | null> {
    return this.postLikesDataRepository.findOneBy({ postId, userId });
  }

  /*Метод для soft удаления поста по ID в БД.*/
  public async markAsDeletedById(id: string): Promise<void> {
    await this.postsRepository.softDelete(id);
  }

  /*Метод для hard удаления поста по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.postsRepository.delete(id);
  }

  /*Метод для soft удаления постов по ID блога в БД.*/
  public async markAllAsDeletedByBlogId(blogId: string): Promise<void> {
    await this.postsRepository.softDelete({ blogId });
  }

  /*Метод для hard удаления постов по ID блога в БД.*/
  public async deleteAllByBlogId(blogId: string): Promise<void> {
    await this.postsRepository.delete({ blogId });
  }

  /*Метод для soft удаления данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async markPostLikeDataAsDeletedByPostIdAndUserId(postId: string, userId: string): Promise<void> {
    await this.postLikesDataRepository.softDelete({ postId, userId });
  }

  /*Метод для hard удаления данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async deletePostLikeDataByPostIdAndUserId(postId: string, userId: string): Promise<void> {
    await this.postLikesDataRepository.delete({ postId, userId });
  }

  /*Метод для soft удаления данных о лайках поста по ID поста в БД.*/
  public async markAllPostLikeDataAsDeletedByPostId(postId: string): Promise<void> {
    await this.postLikesDataRepository.softDelete({ postId });
  }

  /*Метод для hard удаления данных о лайках поста по ID поста в БД.*/
  public async deleteAllPostLikeDataByPostId(postId: string): Promise<void> {
    await this.postLikesDataRepository.delete({ postId });
  }

  /*Метод для soft удаления данных о лайках постов по ID блога в БД.*/
  public async markAllPostLikeDataAsDeletedByBlogId(blogId: string): Promise<void> {
    await this.postLikesDataRepository.softDelete({ blogId });
  }

  /*Метод для hard удаления данных о лайках постов по ID блога в БД.*/
  public async deleteAllPostLikeDataByBlogId(blogId: string): Promise<void> {
    await this.postLikesDataRepository.delete({ blogId });
  }
}
