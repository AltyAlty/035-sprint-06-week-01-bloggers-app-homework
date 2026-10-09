import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { SortDirectionInputDTO } from '../../../../core/pagination/input-dto/sort-direction.input-dto';
import { GetPostListQueryInputDTO } from '../../api/posts/input-dto/query/get-post-list-query.input-dto';
import { PostSortFieldQueryInputDTO } from '../../api/posts/input-dto/query/post-sort-field-query.input-dto';
import {
  NewestPostLikeListOutputDTO,
  NewestPostLikeOutputDTO,
} from '../../api/posts/output-dto/newest-post-like.output-dto';
import { PostLikeStatusDomainDTO } from '../../domain/posts/domain-dto/post-like-status.domain-dto';
import { Post, PostList } from '../../domain/posts/post.entity';
import { PostLikeData } from '../../domain/posts/post-like-data.entity';

/*Query-репозиторий для постов.*/
@Injectable()
export class PostsQueryRepository {
  public constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostLikeData) private readonly postLikesDataRepository: Repository<PostLikeData>
  ) {}

  /*Метод для поиска поста по ID в БД.*/
  public async findById(id: string): Promise<Post | null> {
    return this.postsRepository.findOne({ where: { id }, relations: { blog: true } });
  }

  /*Метод для поиска постов в БД.*/
  public async findAll(
    dto: GetPostListQueryInputDTO,
    blogId?: string
  ): Promise<{ items: PostList; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();

    /*Создаем список допустимых полей для сортировки в целях защиты от SQL-инъекций.*/
    const allowedSortFields: Record<string, keyof Post> = {
      title: 'title',
      shortDescription: 'shortDescription',
      content: 'content',
      blogId: 'blogId',
      createdAt: 'createdAt',
    };

    /*Если пришедшее значение "dto.sortBy" нет в ключах словаря, то выбирается безопасный вариант "createdAt".*/
    const sortField: keyof Post = allowedSortFields[dto.sortBy] ?? 'createdAt';
    /*Маппим направления сортировки в ключевые слова PostgreSQL.*/
    const sortDirection: 'ASC' | 'DESC' = dto.sortDirection === SortDirectionInputDTO.Asc ? 'ASC' : 'DESC';
    /*Динамически собираем условие для клаузы "WHERE": если был передан параметр "blogId", то фильтруем по нему, иначе
    условие для клаузы "WHERE" остается пустым объектом и TypeORM вернет все записи с проверкой на soft удаление.*/
    const where: FindOptionsWhere<Post> = {};
    if (blogId) where.blogId = blogId;

    /*Последовательно выполняем запрос данных и подсчет общего количества элементов.*/
    const [items, totalCount]: [PostList, number] = await this.postsRepository.findAndCount({
      where,
      relations: { blog: true },
      order:
        dto.sortBy === PostSortFieldQueryInputDTO.BlogName
          ? { blog: { name: sortDirection }, id: 'ASC' }
          : { [sortField]: sortDirection, id: 'ASC' },
      skip,
      take: dto.pageSize,
    });

    /*Возвращаем данные по постам.*/
    return { items, totalCount };
  }

  /*Метод для поиска данных о лайке поста по ID поста и ID пользователя в БД.*/
  public async findPostLikeDataByPostIdAndUserId(postId: string, userId: string): Promise<PostLikeData | null> {
    return this.postLikesDataRepository.findOneBy({ postId, userId });
  }

  /*Метод для поиска данных о лайках постов по ID постов и ID пользователя в БД.*/
  public async findAllPostLikesDataByPostIdsAndUserId(postIds: string[], userId: string): Promise<PostLikeData[]> {
    return this.postLikesDataRepository.find({ where: { postId: In(postIds), userId } });
  }

  /*Метод для поиска данных о трех последних лайках поста по ID поста в БД.*/
  public async findLastThreePostLikesByPostId(postId: string): Promise<NewestPostLikeListOutputDTO> {
    const likes: PostLikeData[] = await this.postLikesDataRepository.find({
      where: { postId, likeStatus: PostLikeStatusDomainDTO.Like },
      relations: { user: true },
      order: { addedAt: 'DESC' },
      take: 3,
    });

    /*Возвращаем данные о трех последних лайках поста.*/
    return likes.map((like: PostLikeData): NewestPostLikeOutputDTO => ({
      addedAt: like.addedAt,
      userId: like.userId,
      login: like.user.login,
    }));
  }

  /*Метод для поиска данных о трех последних лайках постов по ID постов в БД.*/
  public async findLastThreeLikesForPostsByPostIds(
    postIds: string[]
  ): Promise<Map<string, NewestPostLikeListOutputDTO>> {
    /*Если массив ID постов пустой, то возвращаем пустой Map.*/
    if (postIds.length === 0) return new Map();
    /*Создаем Map формата "postId: NewestPostLikeListOutputDTO" для группировки результата.*/
    const map: Map<string, NewestPostLikeListOutputDTO> = new Map();

    /*Перебираем ID каждого поста и запрашиваем три последних лайка для каждого из них. Данный подход выполняет N+1
    запросов, то есть по одному запросу на каждый пост, так как оконная функция "ROW_NUMBER() OVER (PARTITION BY ...)"
    не поддерживается в методе "Repository.find()" из TypeORM.*/
    for (const postId of postIds) {
      const likes: PostLikeData[] = await this.postLikesDataRepository.find({
        where: { postId, likeStatus: PostLikeStatusDomainDTO.Like },
        relations: { user: true },
        order: { addedAt: 'DESC' },
        take: 3,
      });

      map.set(
        postId,
        likes.map((like: PostLikeData): NewestPostLikeOutputDTO => ({
          addedAt: like.addedAt,
          userId: like.userId,
          login: like.user.login,
        }))
      );
    }

    /*Возвращаем данные о трех последних лайках постов.*/
    return map;
  }
}
