import { AppDataSource } from '../data-source.js';

import { seedGroups } from './group.seed.js';
import { seedUsers } from './user.seed.js';
import { seedMemberStatuses } from './member-status.seed.js';
import { seedMembers } from './member.seed.js';
import { seedGroupMembers } from './group-member.seed.js';
import { seedCommittees } from './committee.seed.js';
import { seedActivities } from './activity.seed.js';
import { seedPermanences } from './permanence.seed.js';

async function seed() {
  try {
    console.log('Connecting to database...');

    await AppDataSource.initialize();

    console.log('Database connected.\n');
    console.log('Starting seed...\n');

    await seedGroups();

    await seedUsers();

    await seedMemberStatuses();

    await seedMembers();

    await seedGroupMembers();

    await seedCommittees();

    await seedActivities();

    await seedPermanences();

    console.log('\nSeed completed successfully.');
  } catch (error) {
    console.error('\nSeed failed:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

seed();
