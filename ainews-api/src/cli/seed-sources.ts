import dataSource from '../database/data-source.js';
import { sourceSeeds } from '../database/seeds/sources.data.js';
import { Category } from '../categories/entities/category.entity.js';
import { Source } from '../sources/entities/source.entity.js';
import { SourceStatus } from '../sources/enums/source-status.enum.js';
import { uniqueSourceSlug } from '../sources/source-slug.js';

await dataSource.initialize();
await dataSource.runMigrations();

const categories = await dataSource.getRepository(Category).find();
const categoryId = (slug: string | null) => categories.find((c) => c.slug === slug)?.id ?? null;

const existing = await dataSource
  .getRepository(Source)
  .find({ select: { slug: true, siteUrl: true } });
const taken = new Set(existing.map((s) => s.slug));
const knownSites = new Set(existing.map((s) => s.siteUrl));
const fresh = sourceSeeds.filter((seed) => !knownSites.has(seed.siteUrl));

const inserted =
  fresh.length === 0
    ? 0
    : ((
        await dataSource
          .getRepository(Source)
          .createQueryBuilder()
          .insert()
          .values(
            fresh.map((seed) => ({
              name: seed.name,
              slug: uniqueSourceSlug(seed.name, taken),
              siteUrl: seed.siteUrl,
              feedUrl: seed.feedUrl,
              kind: seed.kind,
              language: seed.language,
              defaultCategoryId: categoryId(seed.categorySlug),
              status: seed.feedUrl ? SourceStatus.Pending : SourceStatus.NoFeed,
            })),
          )
          .orIgnore()
          .returning(['id'])
          .execute()
      ).raw.length as number);

console.log(`Sources: ${inserted} added, ${sourceSeeds.length - inserted} already existed`);
await dataSource.destroy();
