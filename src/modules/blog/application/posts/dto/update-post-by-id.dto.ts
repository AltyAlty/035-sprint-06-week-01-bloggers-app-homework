/*DTO для изменения поста по ID.*/
export class UpdatePostByIdDTO {
  public blogId: string;
  public id: string;
  public title: string;
  public shortDescription: string;
  public content: string;
}
