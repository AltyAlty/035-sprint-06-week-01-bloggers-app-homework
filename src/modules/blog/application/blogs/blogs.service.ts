import { Injectable } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { BlogsRepository } from '../../infrastructure/blogs/blogs.repository';
import { BlogOutputDTO } from '../../api/blogs/output-dto/blog.output-dto';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { Blog } from '../../domain/blogs/blog.entity';
import { CreateBlogDTO } from './dto/create-blog.dto';
import { UpdateBlogByIdDTO } from './dto/update-blog-by-id.dto';

/*Сервис для блогов.*/
@Injectable()
export class BlogsService {
  public constructor(
    private readonly postsService: PostsService,
    private readonly blogsRepository: BlogsRepository
  ) {}

  /*Метод для создания блога.*/
  public async create(dto: CreateBlogDTO): Promise<BlogOutputDTO> {
    /*Просим сущность "Blog" создать блог.*/
    const blog: Blog = Blog.create(dto);
    /*Просим репозиторий "BlogsRepository" сохранить блог в БД.*/
    await this.blogsRepository.save(blog);
    /*Преобразовываем блог из БД в подготовленный для отправки клиенту блог и возвращаем его.*/
    return BlogOutputDTO.mapFromBlogToBlogOutputDTO(blog);
  }

  /*Метод для изменения блога по ID.*/
  public async updateById(dto: UpdateBlogByIdDTO): Promise<void> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID в БД.*/
    const blog: Blog | null = await this.blogsRepository.findById(dto.id);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhileUpdating,
        message: 'Blog to update not found',
        field: 'id',
      });

    /*Если блог был найден, то изменяем его.*/
    blog.update(dto);
    /*Просим репозиторий "BlogsRepository" сохранить измененный блог в БД.*/
    await this.blogsRepository.save(blog);
  }

  /*Метод для soft удаления блога по ID.*/
  public async markAsDeletedById(id: string): Promise<void> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID в БД.*/
    const blog: Blog | null = await this.blogsRepository.findById(id);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhileDeleting,
        message: 'Blog to delete not found',
        field: 'id',
      });

    /*Если блог был найден, то просим сервис "PostsService" soft удалить посты по ID блога.*/
    await this.postsService.markAllAsDeletedByBlogId(id);
    /*Просим репозиторий "BlogsRepository" soft удалить блог по ID в БД.*/
    await this.blogsRepository.markAsDeletedById(id);
  }

  /*Метод для hard удаления блога по ID.*/
  public async deleteById(id: string): Promise<void> {
    /*Просим репозиторий "BlogsRepository" найти блог по ID в БД.*/
    const blog: Blog | null = await this.blogsRepository.findById(id);

    /*Если блог не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.BlogNotFoundWhileDeleting,
        message: 'Blog to delete not found',
        field: 'id',
      });

    /*Если блог был найден, то просим сервис "PostsService" hard удалить посты по ID блога.*/
    await this.postsService.deleteAllByBlogId(id);
    /*Просим репозиторий "BlogsRepository" hard удалить блог по ID в БД.*/
    await this.blogsRepository.deleteById(id);
  }
}
