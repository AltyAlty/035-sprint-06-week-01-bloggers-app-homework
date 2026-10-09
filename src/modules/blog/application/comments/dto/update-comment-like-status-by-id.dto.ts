import { CommentLikeStatusInputDTO } from '../../../api/comments/input-dto/update-comment-like-status-by-id.input-dto';

/*DTO для изменения статуса лайка комментария по ID.*/
export class UpdateCommentLikeStatusByIdDTO {
  public id: string;
  public likeStatus: CommentLikeStatusInputDTO;
}
