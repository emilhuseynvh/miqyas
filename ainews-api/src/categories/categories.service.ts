import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity.js';

@Injectable()
export class CategoriesService {
  private slugToId: Promise<Map<string, number>> | null = null;

  constructor(@InjectRepository(Category) private readonly categories: Repository<Category>) {}

  findAll(): Promise<Category[]> {
    return this.categories.find({ order: { sortOrder: 'ASC' } });
  }

  findBySlug(slug: string): Promise<Category | null> {
    return this.categories.findOneBy({ slug });
  }

  idsBySlug(): Promise<Map<string, number>> {
    this.slugToId ??= this.findAll().then((all) => new Map(all.map((c) => [c.slug, c.id])));
    return this.slugToId;
  }
}
