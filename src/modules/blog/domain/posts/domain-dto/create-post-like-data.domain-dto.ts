import { PostLikeStatusDomainDTO } from './post-like-status.domain-dto';

/*Domain DTO для создания данных о лайке поста.*/
export class CreatePostLikeDataDomainDTO {
  public blogId: string;
  public postId: string;
  public userId: string;
  public likeStatus: PostLikeStatusDomainDTO;
}
