if (process.env.NODE_ENV !== 'test') {
  try {
    require('dotenv/config');
  } catch {
    // dotenv not required for production
  }
}

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
