import type { DataSourceOptions } from 'typeorm';
import { Article } from '../articles/entities/article.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { ArticleReaction } from '../engagement/entities/article-reaction.entity.js';
import { ReadingHistory } from '../engagement/entities/reading-history.entity.js';
import { SavedArticle } from '../engagement/entities/saved-article.entity.js';
import { Subscriber } from '../newsletter/entities/subscriber.entity.js';
import { HiddenArticle } from '../recommendations/entities/hidden-article.entity.js';
import { UserInterest } from '../recommendations/entities/user-interest.entity.js';
import { Source } from '../sources/entities/source.entity.js';
import { Story } from '../stories/entities/story.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CreateUsers1794990000000 } from './migrations/1794990000000-create-users.js';
import { CreateNewsTables1794990100000 } from './migrations/1794990100000-create-news-tables.js';
import { AddUserPassword1794990200000 } from './migrations/1794990200000-add-user-password.js';
import { AddNewsCategories1794990300000 } from './migrations/1794990300000-add-news-categories.js';
import { RequirePublishedAt1794990400000 } from './migrations/1794990400000-require-published-at.js';
import { AddArticleSlugAndContent1794990500000 } from './migrations/1794990500000-add-article-slug-and-content.js';
import { AddEngagement1794990600000 } from './migrations/1794990600000-add-engagement.js';
import { AddRecommendationSignals1794990700000 } from './migrations/1794990700000-add-recommendation-signals.js';
import { AddFeedLearning1794990800000 } from './migrations/1794990800000-add-feed-learning.js';
import { AddNewsletter1794990900000 } from './migrations/1794990900000-add-newsletter.js';
import { AddStories1794991000000 } from './migrations/1794991000000-add-stories.js';

type ConnectionSettings = {
  host: string;
  port: number;
  username: string;
  password?: string;
  database: string;
};

export const buildTypeOrmOptions = (settings: ConnectionSettings): DataSourceOptions => ({
  type: 'postgres',
  ...settings,
  entities: [
    User,
    Category,
    Source,
    Article,
    ArticleReaction,
    SavedArticle,
    ReadingHistory,
    HiddenArticle,
    UserInterest,
    Subscriber,
    Story,
  ],
  migrations: [
    CreateUsers1794990000000,
    CreateNewsTables1794990100000,
    AddUserPassword1794990200000,
    AddNewsCategories1794990300000,
    RequirePublishedAt1794990400000,
    AddArticleSlugAndContent1794990500000,
    AddEngagement1794990600000,
    AddRecommendationSignals1794990700000,
    AddFeedLearning1794990800000,
    AddNewsletter1794990900000,
    AddStories1794991000000,
  ],
  migrationsTableName: 'migrations',
  synchronize: false,
});
