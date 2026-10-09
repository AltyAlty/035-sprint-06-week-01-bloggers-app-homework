import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../../domain/blogs/blog.entity';

/*Репозиторий для блогов.*/
@Injectable()
export class BlogsRepository {
  public constructor(@InjectRepository(Blog) private blogsRepository: Repository<Blog>) {}

  /*Метод для сохранения блога в БД.*/
  public async save(blog: Blog): Promise<void> {
    await this.blogsRepository.save(blog);
  }

  /*Метод для поиска блога по ID в БД.*/
  public async findById(id: string): Promise<Blog | null> {
    return await this.blogsRepository.findOneBy({ id });
  }

  /*Метод для soft удаления блога по ID в БД.*/
  public async markAsDeletedById(id: string): Promise<void> {
    await this.blogsRepository.softDelete(id);
  }

  /*Метод для hard удаления блога по ID в БД.*/
  public async deleteById(id: string): Promise<void> {
    await this.blogsRepository.delete(id);
  }
}
