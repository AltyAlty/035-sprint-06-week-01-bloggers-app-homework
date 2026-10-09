import { ApiProperty } from '@nestjs/swagger';
import { Blog, BlogList } from '../../../domain/blogs/blog.entity';

/*Output DTO для блога.*/
export class BlogOutputDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Blog ID' })
  public id: string;

  @ApiProperty({ example: 'blogName', description: 'Blog name' })
  public name: string;

  @ApiProperty({ example: 'blogDescription', description: 'Blog description' })
  public description: string;

  @ApiProperty({ example: 'https://blog-example.xyz/', description: 'Blog website' })
  public websiteUrl: string;

  @ApiProperty({ example: '2026-08-28T04:16:49.315Z', description: 'Blog creation date' })
  public createdAt: Date;

  @ApiProperty({ example: 'true', description: 'Blog membership status' })
  public isMembership: boolean;

  /*Маппер для преобразования блога из БД в подготовленный для отправки клиенту блог.*/
  public static mapFromBlogToBlogOutputDTO(blog: Blog): BlogOutputDTO {
    const blogOutputDTO: BlogOutputDTO = new BlogOutputDTO();
    blogOutputDTO.id = blog.id;
    blogOutputDTO.name = blog.name;
    blogOutputDTO.description = blog.description;
    blogOutputDTO.websiteUrl = blog.websiteUrl;
    blogOutputDTO.createdAt = blog.createdAt;
    blogOutputDTO.isMembership = blog.isMembership;
    return blogOutputDTO;
  }

  /*Маппер для преобразования блогов из БД в подготовленные для отправки клиенту блоги.*/
  public static mapFromBlogListToBlogListOutputDTO(blogs: BlogList): BlogListOutputDTO {
    return blogs.map((blog: Blog) => this.mapFromBlogToBlogOutputDTO(blog));
  }
}

/*Output DTO для списка блогов.*/
export type BlogListOutputDTO = BlogOutputDTO[];
