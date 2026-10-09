/*Domain DTO для создания поста.*/
export class CreatePostDomainDTO {
  public blogId: string;
  public title: string;
  public shortDescription: string;
  public content: string;
}
