import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { SortDirectionInputDTO } from '../../../../core/pagination/input-dto/sort-direction.input-dto';
import { GetBlogListQueryInputDTO } from '../../api/blogs/input-dto/query/get-blog-list-query.input-dto';
import { Blog, BlogList } from '../../domain/blogs/blog.entity';

/*Query-репозиторий для блогов.*/
@Injectable()
export class BlogsQueryRepository {
  public constructor(@InjectRepository(Blog) private blogsRepository: Repository<Blog>) {}

  /*Метод для поиска блога по ID в БД.*/
  public async findById(id: string): Promise<Blog | null> {
    return await this.blogsRepository.findOneBy({ id });
  }

  /*Метод для поиска блогов в БД.*/
  public async findAll(dto: GetBlogListQueryInputDTO): Promise<{ items: Blog[]; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();

    /*Создаем список допустимых полей для сортировки в целях защиты от SQL-инъекций.*/
    const allowedSortFields: Record<string, keyof Blog> = {
      name: 'name',
      description: 'description',
      websiteUrl: 'websiteUrl',
      createdAt: 'createdAt',
    };

    /*Если пришедшее значение "dto.sortBy" нет в ключах словаря, то выбирается безопасный вариант "createdAt".*/
    const sortField: keyof Blog = allowedSortFields[dto.sortBy] ?? 'createdAt';
    /*Маппим направления сортировки в ключевые слова PostgreSQL.*/
    const sortDirection: 'ASC' | 'DESC' = dto.sortDirection === SortDirectionInputDTO.Asc ? 'ASC' : 'DESC';
    /*Динамически собираем условие для клаузы "WHERE": если было передано свойство "dto.searchNameTerm", то добавляем
    условие для оператора "ILIKE", иначе условие для клаузы "WHERE" остается пустым объектом и TypeORM вернет все
    записи с проверкой на soft удаление.*/
    const where: FindOptionsWhere<Blog> = {};
    if (dto.searchNameTerm) where.name = ILike(`%${this._escapeLike(dto.searchNameTerm)}%`);

    /*Последовательно выполняем запрос данных и подсчет общего количества элементов.*/
    const [items, totalCount]: [BlogList, number] = await this.blogsRepository.findAndCount({
      where,
      order: { [sortField]: sortDirection },
      skip,
      take: dto.pageSize,
    });

    /*Возвращаем данные по блогам.*/
    return { items, totalCount };
  }

  /*Создаем метод, который ставит символ "\" перед символами "\", "%" и "_" в строке. Это нужно, так как в SQL-операторе
  "ILIKE" символы "%" и "_" являются командами поиска, а символ "\" является символом экранирования по умолчанию в
  PostgreSQL, и если пользователь введет любой из них в строке поиска, то БД воспримет их как команды, а не как обычные
  символы, что сломает логику поиска.*/
  private _escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
  }
}
