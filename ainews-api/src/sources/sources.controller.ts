import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator.js';
import { SourcesService } from './sources.service.js';

export type PublicSource = { id: string; name: string; slug: string; siteUrl: string };

@Public()
@Controller('sources')
export class SourcesController {
  constructor(private readonly sources: SourcesService) {}

  @Get()
  listPublic(): Promise<(PublicSource & { articleCount: number })[]> {
    return this.sources.findPublicWithCounts();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<PublicSource> {
    const { id, name, siteUrl } = await this.sources.findBySlug(slug);
    return { id, name, slug, siteUrl };
  }
}
