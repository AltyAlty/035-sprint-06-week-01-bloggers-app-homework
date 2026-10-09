import { Injectable } from '@nestjs/common';
import { CommentsService } from '../comments/comments.service';
import { BlogsRepository } from '../../infrastructure/blogs/blogs.repository';
import { PostsRepository } from '../../infrastructure/posts/posts.repository';
import { PostLikeStatusInputDTO } from '../../api/posts/input-dto/update-post-like-status-by-id.input-dto';
import { PostOutputDTO } from '../../api/posts/output-dto/post.output-dto';
import { PostLikeStatusOutputDTO } from '../../api/posts/output-dto/post-like-status.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { Blog } from '../../domain/blogs/blog.entity';
import { PostLikeStatusDomainDTO } from '../../domain/posts/domain-dto/post-like-status.domain-dto';
import { Post } from '../../domain/posts/post.entity';
import { PostLikeData } from '../../domain/posts/post-like-data.entity';
import { CreatePostForBlogDTO } from './dto/create-post-for-blog.dto';
import { UpdatePostByIdDTO } from './dto/update-post-by-id.dto';
import { UpdatePostLikeStatusByIdDTO } from './dto/update-post-like-status-by-id.dto';

/*Сервис для постов.*/
@Injectable()
export class PostsService {
  public constructor(
    private readonly commentsService: CommentsService,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository
  ) {}

  /*Метод для создания поста в блоге.*/
  public async createForBlog(dto: CreatePostForBlogDTO): Promise<PostOutputDTO> {
    /*Получаем ID блога.*/
    const blogId: string = dto.blogId;
    /*Просим репозиторий "BlogsRepository" найти блог по ID.*/
    const blog: Blog | null = await this.blogsRepository.findById(blogId);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhilePostCreating,
        message: 'Blog to create a post not found',
        field: 'blogId',
      });

    /*Если блог был найден, то просим сущность "Post" создать пост.*/
    const post: Post = Post.create({ ...dto, blogId });
    /*Просим репозиторий "postsRepository" сохранить пост в БД.*/
    await this.postsRepository.save(post);
    /*Преобразовываем пост из БД в подготовленный для отправки клиенту пост и возвращаем его.*/
    return PostOutputDTO.mapFromPostToPostOutputDTO(post, blog.name, PostLikeStatusOutputDTO.None, []);
  }

  /*Метод для изменения поста по ID.*/
  public async updateById(dto: UpdatePostByIdDTO): Promise<void> {
    /*Получаем ID блога, в котором находится пост.*/
    const blogId: string = dto.blogId;

    /*Проверяем существование блога.*/
    if (blogId) {
      /*Просим репозиторий "BlogsRepository" найти блог по ID.*/
      const blog: Blog | null = await this.blogsRepository.findById(blogId);

      /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
      if (!blog)
        throw new DomainException({
          code: DomainExceptionCode.BlogNotFoundWhilePostUpdating,
          message: 'Blog to update post not found',
          field: 'blogId',
        });
    }

    /*Просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: Post | null = await this.postsRepository.findById(dto.id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileUpdating,
        message: 'Post to update not found',
        field: 'id',
      });

    /*Если пост был найден, то просим изменяем его.*/
    post.update(dto);
    /*Просим репозиторий "postsRepository" сохранить измененный пост в БД.*/
    await this.postsRepository.save(post);
  }

  /*Метод для изменения статус лайка поста по ID поста.*/
  public async updatePostLikeStatusById(
    dto: UpdatePostLikeStatusByIdDTO,
    userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Получаем ID поста.*/
    const postId: string = dto.id;
    /*Просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: Post | null = await this.postsRepository.findById(postId);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileUpdatingLikeStatus,
        message: 'Post to update like status not found',
        field: 'id',
      });

    /*Получаем ID блога, в котором находится пост.*/
    const blogId: string = post.blogId;
    /*Получаем ID пользователя.*/
    const userId: string = userAccessJwtAuthContext.id;
    /*Получаем статус лайка поста.*/
    const likeStatus: PostLikeStatusInputDTO = dto.likeStatus;

    /*Если пост был найден, то просим репозиторий "PostsRepository" найти данные о лайке для поста по ID поста и ID
    пользователя в БД.*/
    let postLikeData: PostLikeData | null = await this.postsRepository.findPostLikeDataByPostIdAndUserId(
      postId,
      userId
    );

    /*Если пользователь пытается установить повторный статус лайка, то ничего не делаем.*/
    if (
      (postLikeData && postLikeData.likeStatus === (likeStatus as unknown as PostLikeStatusDomainDTO)) ||
      (!postLikeData && likeStatus === PostLikeStatusInputDTO.None)
    ) {
      return;
    }

    /*Если пользователь хочет убрать лайк/дизлайк.*/
    if (likeStatus === PostLikeStatusInputDTO.None) {
      /*Просим репозиторий "PostsRepository" hard удалить данные о лайке поста по ID поста и ID пользователя в БД.*/
      await this.postsRepository.deletePostLikeDataByPostIdAndUserId(postId, userId);

      /*Изменяем количество лайков и дизлайков у поста:
      1. Если уже стоял лайк, то уменьшаем количество лайков на 1.
      2. Если уже стоял дизлайк, то уменьшаем количество дизлайков на 1.*/
      if (postLikeData?.likeStatus === PostLikeStatusDomainDTO.Like) {
        post.updateLikesCount({ likesCount: -1, dislikesCount: 0 });
      } else {
        post.updateLikesCount({ likesCount: 0, dislikesCount: -1 });
      }
    }

    /*Если пользователь хочет поставить лайк.*/
    if (likeStatus === PostLikeStatusInputDTO.Like) {
      /*Если еще не был поставлен лайк.*/
      if (!postLikeData) {
        /*Просим сущность "PostLikeData" создать данные о лайке поста.*/
        postLikeData = PostLikeData.create({
          blogId,
          postId,
          userId,
          likeStatus: likeStatus as unknown as PostLikeStatusDomainDTO,
        });

        /*Изменяем количество лайков и дизлайков у поста:
        1. Увеличиваем количество лайков на 1.
        2. Не меняем количество дизлайков.*/
        post.updateLikesCount({ likesCount: 1, dislikesCount: 0 });
        /*Если уже стоял дизлайк.*/
      } else if (postLikeData.likeStatus === PostLikeStatusDomainDTO.Dislike) {
        /*Изменяем статус лайка поста.*/
        postLikeData.update({ likeStatus: likeStatus as unknown as PostLikeStatusDomainDTO });
        /*Изменяем количество лайков и дизлайков у поста:
        1. Увеличиваем количество лайков на 1.
        2. Уменьшаем количество дизлайков на 1.*/
        post.updateLikesCount({ likesCount: 1, dislikesCount: -1 });
      }

      /*Просим репозиторий "postsRepository" сохранить измененные данные о лайке поста в БД.*/
      await this.postsRepository.savePostLikeData(postLikeData);
    }

    /*Если пользователь хочет поставить дизлайк.*/
    if (likeStatus === PostLikeStatusInputDTO.Dislike) {
      /*Если еще не был поставлен лайк/дизлайк.*/
      if (!postLikeData) {
        /*Просим сущность "PostLikeData" создать данные о лайке поста.*/
        postLikeData = PostLikeData.create({
          blogId,
          postId,
          userId,
          likeStatus: likeStatus as unknown as PostLikeStatusDomainDTO,
        });

        /*Изменяем количество лайков и дизлайков у поста:
        1. Не меняем количество лайков.
        2. Увеличиваем количество дизлайков на 1.*/
        post.updateLikesCount({ likesCount: 0, dislikesCount: 1 });
        /*Если уже стоял лайк.*/
      } else if (postLikeData?.likeStatus === PostLikeStatusDomainDTO.Like) {
        /*Изменяем статус лайка поста.*/
        postLikeData.update({ likeStatus: likeStatus as unknown as PostLikeStatusDomainDTO });
        /*Изменяем количество лайков и дизлайков у поста:
        1. Уменьшаем количество лайков на 1.
        2. Увеличиваем количество дизлайков на 1.*/
        post.updateLikesCount({ likesCount: -1, dislikesCount: 1 });
      }

      /*Просим репозиторий "postsRepository" сохранить измененные данные о лайке поста в БД.*/
      await this.postsRepository.savePostLikeData(postLikeData);
    }

    /*Просим репозиторий "postsRepository" сохранить измененный пост в БД.*/
    await this.postsRepository.save(post);
  }

  /*Метод для soft удаления поста по ID.*/
  public async markAsDeletedById(id: string, blogId?: string): Promise<void> {
    /*Если был указан ID блога, то проверяем его существование.*/
    if (blogId) {
      /*Просим репозиторий "BlogsRepository" найти блог по ID.*/
      const blog: Blog | null = await this.blogsRepository.findById(blogId);

      /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
      if (!blog)
        throw new DomainException({
          code: DomainExceptionCode.BlogNotFoundWhilePostDeleting,
          message: 'Blog to delete a post not found',
          field: 'blogId',
        });
    }

    /*Просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: Post | null = await this.postsRepository.findById(id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileDeleting,
        message: 'Post to delete not found',
        field: 'id',
      });

    /*Если пост был найден, то просим сервис "CommentsService" soft удалить комментарии по ID поста.*/
    await this.commentsService.markAllAsDeletedByPostId(id);
    /*Просим репозиторий "PostsRepository" soft удалить данные о лайках поста по ID поста в БД.*/
    await this.postsRepository.markAllPostLikeDataAsDeletedByPostId(id);
    /*Просим репозиторий "PostsRepository" soft удалить пост по ID в БД.*/
    await this.postsRepository.markAsDeletedById(id);
  }

  /*Метод для hard удаления поста по ID.*/
  public async deleteById(id: string, blogId?: string): Promise<void> {
    /*Если был указан ID блога, то проверяем его существование.*/
    if (blogId) {
      /*Просим репозиторий "BlogsRepository" найти блог по ID.*/
      const blog: Blog | null = await this.blogsRepository.findById(blogId);

      /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
      if (!blog)
        throw new DomainException({
          code: DomainExceptionCode.BlogNotFoundWhilePostDeleting,
          message: 'Blog to delete a post not found',
          field: 'blogId',
        });
    }

    /*Просим репозиторий "PostsRepository" найти пост по ID в БД.*/
    const post: Post | null = await this.postsRepository.findById(id);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileDeleting,
        message: 'Post to delete not found',
        field: 'id',
      });

    /*Если пост был найден, то просим сервис "CommentsService" hard удалить комментарии по ID поста.*/
    await this.commentsService.deleteAllByPostId(id);
    /*Просим репозиторий "PostsRepository" hard удалить данные о лайках поста по ID поста в БД.*/
    await this.postsRepository.deleteAllPostLikeDataByPostId(id);
    /*Просим репозиторий "PostsRepository" hard удалить пост по ID в БД.*/
    await this.postsRepository.deleteById(id);
  }

  /*Метод для soft удаления постов по ID блога.*/
  public async markAllAsDeletedByBlogId(id: string): Promise<void> {
    /*Просим репозиторий "CommentsService" soft удалить комментарии по ID блога.*/
    await this.commentsService.markAllAsDeletedByBlogId(id);
    /*Просим репозиторий "PostsRepository" soft удалить данные о лайках постов по ID блога в БД.*/
    await this.postsRepository.markAllPostLikeDataAsDeletedByBlogId(id);
    /*Просим репозиторий "PostsRepository" soft удалить посты по ID блога в БД.*/
    await this.postsRepository.markAllAsDeletedByBlogId(id);
  }

  /*Метод для hard удаления постов по ID блога.*/
  public async deleteAllByBlogId(id: string): Promise<void> {
    /*Просим репозиторий "CommentsService" hard удалить комментарии по ID блога.*/
    await this.commentsService.deleteAllByBlogId(id);
    /*Просим репозиторий "PostsRepository" hard удалить данные о лайках постов по ID блога в БД.*/
    await this.postsRepository.deleteAllPostLikeDataByBlogId(id);
    /*Просим репозиторий "PostsRepository" hard удалить посты по ID блога в БД.*/
    await this.postsRepository.deleteAllByBlogId(id);
  }
}
