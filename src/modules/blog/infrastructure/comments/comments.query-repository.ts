import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { SortDirectionInputDTO } from '../../../../core/pagination/input-dto/sort-direction.input-dto';
import { GetCommentListByPostIdQueryInputDTO } from '../../api/posts/input-dto/query/get-comment-list-by-post-id-query.input-dto';
import { Comment, CommentList } from '../../domain/comments/comment.entity';
import { CommentLikeData, CommentLikeDataList } from '../../domain/comments/comment-like-data.entity';

/*Query-репозиторий для комментариев .*/
@Injectable()
export class CommentsQueryRepository {
  public constructor(
    @InjectRepository(Comment) private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(CommentLikeData) private readonly commentLikesDataRepository: Repository<CommentLikeData>
  ) {}

  /*Метод для поиска комментария по ID в БД.*/
  public async findById(id: string): Promise<Comment | null> {
    return this.commentsRepository.findOne({ where: { id }, relations: { user: true } });
  }

  /*Метод для поиска комментариев по ID поста в БД.*/
  public async findAllByPostId(
    postId: string,
    dto: GetCommentListByPostIdQueryInputDTO
  ): Promise<{ items: CommentList; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();

    /*Создаем список допустимых полей для сортировки в целях защиты от SQL-инъекций.*/
    const allowedSortFields: Record<string, keyof Comment> = {
      postId: 'postId',
      content: 'content',
      createdAt: 'createdAt',
    };

    /*Если пришедшее значение "dto.sortBy" нет в ключах словаря, то выбирается безопасный вариант "createdAt".*/
    const sortField: keyof Comment = allowedSortFields[dto.sortBy] ?? 'createdAt';
    /*Маппим направления сортировки в ключевые слова PostgreSQL.*/
    const sortDirection: 'ASC' | 'DESC' = dto.sortDirection === SortDirectionInputDTO.Asc ? 'ASC' : 'DESC';
    /*Динамически собираем условие для клаузы "WHERE": всегда фильтруем по параметру "postId".*/
    const where: FindOptionsWhere<Comment> = { postId };

    /*Последовательно выполняем запрос данных и подсчет общего количества элементов.*/
    const [items, totalCount]: [CommentList, number] = await this.commentsRepository.findAndCount({
      where,
      relations: { user: true },
      order: { [sortField]: sortDirection, id: 'ASC' },
      skip,
      take: dto.pageSize,
    });

    /*Возвращаем данные по комментариям.*/
    return { items, totalCount };
  }

  /*Метод для поиска данных о лайке комментария по ID комментария и ID пользователя в БД.*/
  public async findCommentLikeDataByCommentIdAndUserId(
    commentId: string,
    userId: string
  ): Promise<CommentLikeData | null> {
    return this.commentLikesDataRepository.findOneBy({ commentId, userId });
  }

  /*Метод для поиска данных о лайках комментариев по ID комментариев и ID пользователя в БД.*/
  public async findAllCommentLikesDataByCommentIdsAndUserId(
    commentIds: string[],
    userId: string
  ): Promise<CommentLikeDataList> {
    if (commentIds.length === 0) return [];
    return this.commentLikesDataRepository.findBy({ commentId: In(commentIds), userId });
  }
}
