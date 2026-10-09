import { ApiProperty } from '@nestjs/swagger';
import { CommentsQueryRepository } from '../../../infrastructure/comments/comments.query-repository';
import { CommentLikeStatusOutputDTO } from './comment-like-status.output-dto';
import { CommentatorInfoOutputDTO } from './commentator-info.output-dto';
import { LikesInfoOutputDTO } from './likes-info.output-dto';
import { Comment, CommentList } from '../../../domain/comments/comment.entity';
import { CommentLikeData, CommentLikeDataList } from '../../../domain/comments/comment-like-data.entity';

/*Output DTO для комментария.*/
export class CommentOutputDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Comment ID' })
  public id: string;

  @ApiProperty({ example: 'commentContent', description: 'Comment content' })
  public content: string;

  @ApiProperty({ description: 'Post commentator data' })
  public commentatorInfo: CommentatorInfoOutputDTO;

  @ApiProperty({ example: '2026-08-28T04:16:49.315Z', description: 'Comment creation date' })
  public createdAt: Date;

  @ApiProperty({ description: 'Comment likes data' })
  public likesInfo: LikesInfoOutputDTO;

  /*Маппер для преобразования комментария из БД в подготовленный для отправки клиенту комментарий.*/
  public static mapFromCommentToCommentOutputDTO(
    comment: Comment,
    likeStatus: CommentLikeStatusOutputDTO,
    userLogin: string
  ): CommentOutputDTO {
    const commentOutputDTO: CommentOutputDTO = new CommentOutputDTO();
    commentOutputDTO.id = comment.id;
    commentOutputDTO.content = comment.content;
    commentOutputDTO.commentatorInfo = { userId: comment.userId, userLogin };
    commentOutputDTO.createdAt = comment.createdAt;

    commentOutputDTO.likesInfo = {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      myStatus: likeStatus,
    };

    return commentOutputDTO;
  }

  /*Маппер для преобразования комментариев из БД в подготовленные для отправки клиенту комментарии.*/
  public static async mapFromCommentListToCommentListOutputDTO(
    comments: CommentList,
    commentsQueryRepository: CommentsQueryRepository,
    userId: string | undefined
  ): Promise<CommentListOutputDTO> {
    /*Если в виде комментариев был передан пустой массив, то возвращаем пустой массив.*/
    if (comments.length === 0) return [];
    /*Получаем ID комментариев.*/
    const commentIds: string[] = comments.map((comment: Comment): string => comment.id);
    /*Создаем Map формата "commentId: likeStatus", чтобы избежать многочисленных запросов в БД для получения статусов
    лайков пользователя каждого комментария.*/
    let commentLikesDataMap: Map<string, CommentLikeStatusOutputDTO> = new Map<string, CommentLikeStatusOutputDTO>();

    /*Если был передан ID пользователя, то получаем статусы лайков пользователя каждого комментария.*/
    if (userId) {
      /*Просим query-репозиторий "CommentsQueryRepository" найти данные о лайках комментариев по ID комментариев и ID
      пользователя в БД.*/
      const commentLikesData: CommentLikeDataList =
        await commentsQueryRepository.findAllCommentLikesDataByCommentIdsAndUserId(commentIds, userId);

      /*Заполняем Map статусами лайков пользователя каждого комментария, не обращаясь в БД.*/
      commentLikesDataMap = new Map(
        commentLikesData.map((commentLikeData: CommentLikeData): [string, CommentLikeStatusOutputDTO] => [
          commentLikeData.commentId,
          commentLikeData.likeStatus as unknown as CommentLikeStatusOutputDTO,
        ])
      );
    }

    /*Формируем массив подготовленных для отправки клиенту комментариев.*/
    return comments.map((comment: Comment): CommentOutputDTO => {
      /*Получаем статус лайка комментария.*/
      const likeStatus: CommentLikeStatusOutputDTO =
        commentLikesDataMap.get(comment.id) ?? CommentLikeStatusOutputDTO.None;

      /*Преобразовываем комментарий из БД в подготовленный для отправки клиенту комментарий.*/
      return this.mapFromCommentToCommentOutputDTO(comment, likeStatus, comment.user.login);
    });
  }
}

/*Output DTO для списка комментариев.*/
export type CommentListOutputDTO = CommentOutputDTO[];
