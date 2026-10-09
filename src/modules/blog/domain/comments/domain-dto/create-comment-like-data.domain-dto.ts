import { CommentLikeStatusDomainDTO } from './comment-like-status.domain-dto';

/*Domain DTO для создания данных о лайке комментария.*/
export class CreateCommentLikeDataDomainDTO {
  public blogId: string;
  public postId: string;
  public commentId: string;
  public userId: string;
  public likeStatus: CommentLikeStatusDomainDTO;
}
