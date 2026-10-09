import { PostLikeStatusInputDTO } from '../../../api/posts/input-dto/update-post-like-status-by-id.input-dto';

/*DTO для изменения статуса лайка поста по ID.*/
export class UpdatePostLikeStatusByIdDTO {
  public id: string;
  public likeStatus: PostLikeStatusInputDTO;
}
