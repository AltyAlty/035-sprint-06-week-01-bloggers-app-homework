/*DTO для создания поста в блоге.*/
export class CreatePostForBlogDTO {
  blogId: string;
  public title: string;
  public shortDescription: string;
  public content: string;
}
