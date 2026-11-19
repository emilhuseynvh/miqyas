import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { type Paginated, paginate } from '../common/pagination.js';
import type { SourceQueryDto } from './dto/source-query.dto.js';
import type { CreateSourceDto, UpdateSourceDto } from './dto/upsert-source.dto.js';
import { Source } from './entities/source.entity.js';
import { SourceStatus } from './enums/source-status.enum.js';
import { uniqueSourceSlug } from './source-slug.js';

const MAX_ERROR_LENGTH = 500;

@Injectable()
export class SourcesService {
  constructor(@InjectRepository(Source) private readonly sources: Repository<Source>) {}

  async findPage(query: SourceQueryDto): Promise<Paginated<Source>> {
    const qb = this.sources
      .createQueryBuilder('source')
      .leftJoinAndSelect('source.defaultCategory', 'category')
      .loadRelationCountAndMap('source.articleCount', 'source.articles')
      .orderBy('source.consecutiveFailures', 'DESC')
      .addOrderBy('source.name', 'ASC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    if (query.status) qb.andWhere('source.status = :status', { status: query.status });
    if (query.active !== undefined)
      qb.andWhere('source.isActive = :active', { active: query.active });
    if (query.search) {
      qb.andWhere('(source.name ILIKE :search OR source.siteUrl ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, query);
  }

  findPublicWithCounts(): Promise<
    { id: string; name: string; slug: string; siteUrl: string; articleCount: number }[]
  > {
    return this.sources.query(
      `SELECT s.id, s.name, s.slug, s.site_url AS "siteUrl", COUNT(a.id)::int AS "articleCount"
         FROM sources s
         JOIN articles a ON a.source_id = s.id
        WHERE s.is_active = true AND s.language = 'az'
        GROUP BY s.id
       HAVING COUNT(a.id) > 0
        ORDER BY COUNT(a.id) DESC`,
    );
  }

  async findBySlug(slug: string): Promise<Source> {
    const source = await this.sources.findOneBy({ slug });
    if (!source) throw new NotFoundException('Source not found');
    return source;
  }

  async findOne(id: string): Promise<Source> {
    const source = await this.sources.findOne({
      where: { id },
      relations: { defaultCategory: true },
    });
    if (!source) throw new NotFoundException('Source not found');
    return source;
  }

  findFetchable(): Promise<Source[]> {
    return this.sources.find({ where: { isActive: true, feedUrl: Not(IsNull()) } });
  }

  async countByStatus(): Promise<Record<SourceStatus | 'inactive' | 'total', number>> {
    const rows = await this.sources
      .createQueryBuilder('source')
      .select('source.status', 'status')
      .addSelect('COUNT(*)::int', 'count')
      .where('source.isActive = true')
      .groupBy('source.status')
      .getRawMany<{ status: SourceStatus; count: number }>();
    const inactive = await this.sources.countBy({ isActive: false });
    const result = {
      [SourceStatus.Pending]: 0,
      [SourceStatus.Healthy]: 0,
      [SourceStatus.Failing]: 0,
      [SourceStatus.NoFeed]: 0,
      inactive,
      total: inactive,
    };
    for (const row of rows) {
      result[row.status] = row.count;
      result.total += row.count;
    }
    return result;
  }

  async create(dto: CreateSourceDto): Promise<Source> {
    const exists = await this.sources.existsBy({ siteUrl: dto.siteUrl });
    if (exists) throw new ConflictException('A source with this site URL already exists');
    const slugs = await this.sources.find({ select: { slug: true } });
    const source = this.sources.create({
      ...dto,
      slug: uniqueSourceSlug(dto.name, new Set(slugs.map((s) => s.slug))),
      status: dto.feedUrl ? SourceStatus.Pending : SourceStatus.NoFeed,
    });
    return this.sources.save(source);
  }

  async update(id: string, dto: UpdateSourceDto): Promise<Source> {
    const source = await this.findOne(id);
    const feedChanged = dto.feedUrl !== undefined && dto.feedUrl !== source.feedUrl;
    Object.assign(source, dto);
    if (feedChanged) {
      source.status = source.feedUrl ? SourceStatus.Pending : SourceStatus.NoFeed;
      source.consecutiveFailures = 0;
      source.lastError = null;
    }
    return this.sources.save(source);
  }

  async recordSuccess(source: Source, itemCount: number): Promise<void> {
    const now = new Date();
    await this.sources.update(source.id, {
      status: SourceStatus.Healthy,
      lastFetchedAt: now,
      lastSuccessAt: now,
      lastError: null,
      consecutiveFailures: 0,
      lastItemCount: itemCount,
    });
  }

  async recordFailure(source: Source, error: string): Promise<void> {
    await this.sources.update(source.id, {
      status: SourceStatus.Failing,
      lastFetchedAt: new Date(),
      lastError: error.slice(0, MAX_ERROR_LENGTH),
      consecutiveFailures: () => 'consecutive_failures + 1',
    });
  }
}
