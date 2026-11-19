import { IsNull } from 'typeorm';
import { Article } from '../articles/entities/article.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { detectCategorySlug } from '../categories/category-detector.js';
import dataSource from '../database/data-source.js';

const BATCH = 1000;

await dataSource.initialize();
await dataSource.runMigrations();

const categories = await dataSource.getRepository(Category).find();
const ids = new Map(categories.map((c) => [c.slug, c.id]));
const articles = dataSource.getRepository(Article);

let scanned = 0;
let assigned = 0;
let lastId = '00000000-0000-0000-0000-000000000000';

for (;;) {
  const batch = await articles
    .createQueryBuilder('article')
    .select(['article.id', 'article.title', 'article.feedCategories'])
    .where({ categoryId: IsNull() })
    .andWhere('article.id > :lastId', { lastId })
    .orderBy('article.id')
    .take(BATCH)
    .getMany();
  if (batch.length === 0) break;

  for (const article of batch) {
    const categoryId = ids.get(detectCategorySlug(article) ?? '');
    if (categoryId) {
      await articles.update(article.id, { categoryId });
      assigned++;
    }
  }
  scanned += batch.length;
  lastId = batch[batch.length - 1].id;
}

console.log(`Categorized ${assigned} of ${scanned} uncategorized articles`);
await dataSource.destroy();
