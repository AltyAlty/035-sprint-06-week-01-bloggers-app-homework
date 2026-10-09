import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments/comments.repository';
import { PostsRepository } from '../../infrastructure/posts/posts.repository';
import { CommentLikeStatusInputDTO } from '../../api/comments/input-dto/update-comment-like-status-by-id.input-dto';
import { CommentOutputDTO } from '../../api/comments/output-dto/comment.output-dto';
import { CommentLikeStatusOutputDTO } from '../../api/comments/output-dto/comment-like-status.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { Comment } from '../../domain/comments/comment.entity';
import { CommentLikeData } from '../../domain/comments/comment-like-data.entity';
import { CommentLikeStatusDomainDTO } from '../../domain/comments/domain-dto/comment-like-status.domain-dto';
import { Post } from '../../domain/posts/post.entity';
import { CreateCommentForPostDTO } from './dto/create-comment-for-post.dto';
import { UpdateCommentByIdDTO } from './dto/update-comment-by-id.dto';
import { UpdateCommentLikeStatusByIdDTO } from './dto/update-comment-like-status-by-id.dto';

/*Сервис для комментариев.*/
@Injectable()
export class CommentsService {
  public constructor(
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository
  ) {}

  /*Метод для создания комментария в посте.*/
  public async createForPost(
    dto: CreateCommentForPostDTO,
    userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<CommentOutputDTO> {
    /*Получаем ID поста.*/
    const postId: string = dto.postId;
    /*Просим репозиторий "PostsRepository" найти пост по ID.*/
    const post: Post | null = await this.postsRepository.findById(postId);

    /*Если пост не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.PostNotFoundWhileCommentCreating,
        message: 'Post to create a comment not found',
        field: 'postId',
      });

    /*Если пост был найден, то просим сущность "Comment" создать комментарий.*/
    const comment: Comment = Comment.create({
      blogId: post.blogId,
      postId,
      userId: userAccessJwtAuthContext.id,
      content: dto.content,
    });

    /*Просим репозиторий "commentsRepository" сохранить комментарий в БД.*/
    await this.commentsRepository.save(comment);

    /*Преобразовываем комментарий из БД в подготовленный для отправки клиенту комментарий и возвращаем его.*/
    return CommentOutputDTO.mapFromCommentToCommentOutputDTO(
      comment,
      CommentLikeStatusOutputDTO.None,
      userAccessJwtAuthContext.login
    );
  }

  /*Метод для изменения комментария по ID.*/
  public async updateById(
    dto: UpdateCommentByIdDTO,
    userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: Comment | null = await this.commentsRepository.findById(dto.id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileUpdating,
        message: 'Comment to update not found',
        field: 'id',
      });

    /*Если пользователь не является владельцем комментария, то выбрасываем исключение с информацией об этом.*/
    if (comment.userId !== userAccessJwtAuthContext.id)
      throw new DomainException({
        code: DomainExceptionCode.WrongCommentOwnerWhileUpdating,
        message: 'The user is not the owner of the comment to update',
        field: 'id',
      });

    /*Если комментарий был найден и пользователь является его владельцем, то просим изменяем его.*/
    comment.update(dto);
    /*Просим репозиторий "commentsRepository" сохранить измененный комментарий в БД.*/
    await this.commentsRepository.save(comment);
  }

  /*Метод для изменения статус лайка комментария по ID комментария.*/
  public async updateCommentLikeStatusById(
    dto: UpdateCommentLikeStatusByIdDTO,
    userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<void> {
    /*Получаем ID комментария.*/
    const commentId: string = dto.id;
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: Comment | null = await this.commentsRepository.findById(commentId);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileUpdatingLikeStatus,
        message: 'Comment to update like status not found',
        field: 'id',
      });

    /*Получаем ID блога, в котором находится комментарий.*/
    const blogId: string = comment.blogId;
    /*Получаем ID поста, в котором находится комментарий.*/
    const postId: string = comment.postId;
    /*Получаем ID пользователя.*/
    const userId: string = userAccessJwtAuthContext.id;
    /*Получаем статус лайка комментария.*/
    const likeStatus: CommentLikeStatusInputDTO = dto.likeStatus;

    /*Если комментарий был найден, то просим репозиторий "CommentsRepository" найти данные о лайке для комментария по ID
    комментария и ID пользователя в БД.*/
    let commentLikeData: CommentLikeData | null = await this.commentsRepository.findCommentLikeDataByCommentIdAndUserId(
      commentId,
      userId
    );

    /*Если пользователь пытается установить повторный статус лайка, то ничего не делаем.*/
    if (
      (commentLikeData && commentLikeData.likeStatus === (likeStatus as unknown as CommentLikeStatusDomainDTO)) ||
      (!commentLikeData && likeStatus === CommentLikeStatusInputDTO.None)
    ) {
      return;
    }

    /*Если пользователь хочет убрать лайк/дизлайк.*/
    if (likeStatus === CommentLikeStatusInputDTO.None) {
      /*Просим репозиторий "CommentsRepository" hard удалить данные о лайке комментария по ID комментария и ID
      пользователя в БД.*/
      await this.commentsRepository.deleteCommentLikeDataByCommentIdAndUserId(commentId, userId);

      /*Изменяем количество лайков и дизлайков у комментария:
      1. Если уже стоял лайк, то уменьшаем количество лайков на 1.
      2. Если уже стоял дизлайк, то уменьшаем количество дизлайков на 1.*/
      if (commentLikeData?.likeStatus === CommentLikeStatusDomainDTO.Like) {
        comment.updateLikesCount({ likesCount: -1, dislikesCount: 0 });
      } else {
        comment.updateLikesCount({ likesCount: 0, dislikesCount: -1 });
      }
    }

    /*Если пользователь хочет поставить лайк.*/
    if (likeStatus === CommentLikeStatusInputDTO.Like) {
      /*Если еще не был поставлен лайк.*/
      if (!commentLikeData) {
        /*Просим сущность "CommentLikeData" создать данные о лайке комментария.*/
        commentLikeData = CommentLikeData.create({
          blogId,
          postId,
          commentId,
          userId,
          likeStatus: likeStatus as unknown as CommentLikeStatusDomainDTO,
        });

        /*Изменяем количество лайков и дизлайков у комментария:
        1. Увеличиваем количество лайков на 1.
        2. Не меняем количество дизлайков.*/
        comment.updateLikesCount({ likesCount: 1, dislikesCount: 0 });
        /*Если уже стоял дизлайк.*/
      } else if (commentLikeData.likeStatus === CommentLikeStatusDomainDTO.Dislike) {
        /*Изменяем статус лайка комментария.*/
        commentLikeData.update({ likeStatus: likeStatus as unknown as CommentLikeStatusDomainDTO });
        /*Изменяем количество лайков и дизлайков у комментария:
        1. Увеличиваем количество лайков на 1.
        2. Уменьшаем количество дизлайков на 1.*/
        comment.updateLikesCount({ likesCount: 1, dislikesCount: -1 });
      }

      /*Просим репозиторий "commentsRepository" сохранить измененные данные о лайке комментария в БД.*/
      await this.commentsRepository.saveCommentLikeData(commentLikeData);
    }

    /*Если пользователь хочет поставить дизлайк.*/
    if (likeStatus === CommentLikeStatusInputDTO.Dislike) {
      /*Если еще не был поставлен дизлайк.*/
      if (!commentLikeData) {
        /*Просим сущность "CommentLikeData" создать данные о лайке комментария.*/
        commentLikeData = CommentLikeData.create({
          blogId,
          postId,
          commentId,
          userId,
          likeStatus: likeStatus as unknown as CommentLikeStatusDomainDTO,
        });

        /*Изменяем количество лайков и дизлайков у комментария:
        1. Не меняем количество лайков.
        2. Увеличиваем количество дизлайков на 1.*/
        comment.updateLikesCount({ likesCount: 0, dislikesCount: 1 });
        /*Если уже стоял лайк.*/
      } else if (commentLikeData?.likeStatus === CommentLikeStatusDomainDTO.Like) {
        /*Изменяем статус лайка комментария.*/
        commentLikeData.update({ likeStatus: likeStatus as unknown as CommentLikeStatusDomainDTO });
        /*Изменяем количество лайков и дизлайков у комментария:
        1. Уменьшаем количество лайков на 1.
        2. Увеличиваем количество дизлайков на 1.*/
        comment.updateLikesCount({ likesCount: -1, dislikesCount: 1 });
      }

      /*Просим репозиторий "commentsRepository" сохранить измененные данные о лайке комментария в БД.*/
      await this.commentsRepository.saveCommentLikeData(commentLikeData);
    }

    /*Просим репозиторий "commentsRepository" сохранить измененный комментарий в БД.*/
    await this.commentsRepository.save(comment);
  }

  /*Метод для soft удаления комментария по ID.*/
  public async markAsDeletedById(id: string, userAccessJwtAuthContext: UserAccessJwtAuthContextDTO): Promise<void> {
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: Comment | null = await this.commentsRepository.findById(id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileDeleting,
        message: 'Comment to delete not found',
        field: 'id',
      });

    /*Если пользователь не является владельцем комментария, то выбрасываем исключение с информацией об этом.*/
    if (comment.userId !== userAccessJwtAuthContext.id)
      throw new DomainException({
        code: DomainExceptionCode.WrongCommentOwnerWhileDeleting,
        message: 'The user is not the owner of the comment to delete',
        field: 'id',
      });

    /*Если комментарий был найден и пользователь является его владельцем, то просим репозиторий "CommentsRepository"
    soft удалить данные о лайках комментария по ID комментария в БД.*/
    await this.commentsRepository.markAllCommentLikeDataAsDeletedByCommentId(id);
    /*Просим репозиторий "CommentsRepository" soft удалить комментарий по ID в БД.*/
    await this.commentsRepository.markAsDeletedById(id);
  }

  /*Метод для hard удаления комментария по ID.*/
  public async deleteById(id: string, userAccessJwtAuthContext: UserAccessJwtAuthContextDTO): Promise<void> {
    /*Просим репозиторий "CommentsRepository" найти комментарий по ID в БД.*/
    const comment: Comment | null = await this.commentsRepository.findById(id);

    /*Если комментарий не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!comment)
      throw new DomainException({
        code: DomainExceptionCode.CommentNotFoundWhileDeleting,
        message: 'Comment to delete not found',
        field: 'id',
      });

    /*Если пользователь не является владельцем комментария, то выбрасываем исключение с информацией об этом.*/
    if (comment.userId !== userAccessJwtAuthContext.id)
      throw new DomainException({
        code: DomainExceptionCode.WrongCommentOwnerWhileDeleting,
        message: 'The user is not the owner of the comment to delete',
        field: 'id',
      });

    /*Если комментарий был найден и пользователь является его владельцем, то просим репозиторий "CommentsRepository"
    hard удалить данные о лайках комментария по ID комментария в БД.*/
    await this.commentsRepository.deleteAllCommentLikeDataByCommentId(id);
    /*Просим репозиторий "CommentsRepository" hard удалить комментарий по ID в БД.*/
    await this.commentsRepository.deleteById(id);
  }

  /*Метод для soft удаления комментариев по ID поста.*/
  public async markAllAsDeletedByPostId(id: string): Promise<void> {
    /*Просим репозиторий "CommentsRepository" soft удалить данные о лайках комментария по ID поста в БД.*/
    await this.commentsRepository.markAllCommentLikeDataAsDeletedByPostId(id);
    /*Просим репозиторий "CommentsRepository" soft удалить комментарии по ID поста в БД.*/
    await this.commentsRepository.markAllAsDeletedByPostId(id);
  }

  /*Метод для hard удаления комментариев по ID поста.*/
  public async deleteAllByPostId(id: string): Promise<void> {
    /*Просим репозиторий "CommentsRepository" hard удалить данные о лайках комментария по ID поста в БД.*/
    await this.commentsRepository.deleteAllCommentLikeDataByPostId(id);
    /*Просим репозиторий "CommentsRepository" hard удалить комментарии по ID поста в БД.*/
    await this.commentsRepository.deleteAllByPostId(id);
  }

  /*Метод для soft удаления комментариев по ID блога.*/
  public async markAllAsDeletedByBlogId(id: string): Promise<void> {
    /*Просим репозиторий "CommentsRepository" soft удалить данные о лайках комментария по ID блога в БД.*/
    await this.commentsRepository.markAllCommentLikeDataAsDeletedByBlogId(id);
    /*Просим репозиторий "CommentsRepository" soft удалить комментарии по ID блога в БД.*/
    await this.commentsRepository.markAllAsDeletedByBlogId(id);
  }

  /*Метод для hard удаления комментариев по ID блога.*/
  public async deleteAllByBlogId(id: string): Promise<void> {
    /*Просим репозиторий "CommentsRepository" hard удалить данные о лайках комментария по ID блога в БД.*/
    await this.commentsRepository.deleteAllCommentLikeDataByBlogId(id);
    /*Просим репозиторий "CommentsRepository" hard удалить комментарии по ID блога в БД.*/
    await this.commentsRepository.deleteAllByBlogId(id);
  }
}
