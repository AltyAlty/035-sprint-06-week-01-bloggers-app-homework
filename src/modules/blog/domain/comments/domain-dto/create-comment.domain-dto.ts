/*Domain DTO для создания комментария.*/
export class CreateCommentDomainDTO {
  public blogId: string;
  public postId: string;
  public userId: string;
  public content: string;
}
