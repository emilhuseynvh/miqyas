import { parseArgs } from 'node:util';
import { PasswordService } from '../auth/password.service.js';
import dataSource from '../database/data-source.js';
import { User } from '../users/entities/user.entity.js';
import { UserRole } from '../users/enums/user-role.enum.js';

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    'first-name': { type: 'string', default: 'Admin' },
    'last-name': { type: 'string', default: 'Miqyas' },
  },
});

const email = values.email?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Usage: ADMIN_PASSWORD=... npm run admin:create -- --email you@example.com');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters long');
  process.exit(1);
}

await dataSource.initialize();
await dataSource.runMigrations();

const users = dataSource.getRepository(User);
const passwordHash = await new PasswordService().hash(password);
const existing = await users.findOneBy({ email });

if (existing) {
  await users.update(existing.id, { role: UserRole.Admin, passwordHash });
  console.log(`Updated ${email}: role set to admin, password changed`);
} else {
  await users.insert({
    email,
    firstName: values['first-name'] as string,
    lastName: values['last-name'] as string,
    role: UserRole.Admin,
    passwordHash,
  });
  console.log(`Created admin ${email}`);
}

await dataSource.destroy();
