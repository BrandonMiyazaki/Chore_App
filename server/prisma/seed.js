const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateJoinCode } = require('../src/utils/joinCode');

const prisma = new PrismaClient();

const DEFAULT_LESSONS = [
  { title: 'Read for 20 min', icon: '📚', topic: 'Reading', points: 20 },
  { title: 'Math puzzles', icon: '🧩', topic: 'Math', points: 15 },
  { title: 'Science experiment', icon: '🧪', topic: 'Science', points: 20 },
  { title: 'Draw a picture', icon: '🎨', topic: 'Art', points: 10 },
  { title: 'Learn a new song', icon: '🎵', topic: 'Music', points: 15 },
  { title: 'Geography quiz', icon: '🌎', topic: 'Geography', points: 15 },
  { title: 'Write a short story', icon: '✍️', topic: 'Writing', points: 20 },
  { title: 'History facts', icon: '🏰', topic: 'History', points: 15 },
  { title: 'Spelling practice', icon: '📝', topic: 'Language', points: 10 },
  { title: 'Nature observation', icon: '🌿', topic: 'Science', points: 10 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo household
  const joinCode = generateJoinCode();
  const household = await prisma.household.create({
    data: {
      name: 'Demo Family',
      joinCode,
    },
  });
  console.log(`  ✅ Household "${household.name}" created (join code: ${joinCode})`);

  // Create a parent user (PIN: 1234)
  const parentPin = await bcrypt.hash('1234', 10);
  const parent = await prisma.user.create({
    data: {
      householdId: household.id,
      name: 'Parent',
      pin: parentPin,
      role: 'parent',
      avatarUrl: '🐻',
    },
  });
  console.log(`  ✅ Parent user "${parent.name}" created (PIN: 1234)`);

  // Create a kid user (PIN: 0000)
  const kidPin = await bcrypt.hash('0000', 10);
  const kid = await prisma.user.create({
    data: {
      householdId: household.id,
      name: 'Alex',
      pin: kidPin,
      role: 'kid',
      avatarUrl: '🦊',
      totalPoints: 0,
    },
  });
  console.log(`  ✅ Kid user "${kid.name}" created (PIN: 0000)`);

  // Create default lessons
  for (const lesson of DEFAULT_LESSONS) {
    await prisma.lesson.create({
      data: {
        householdId: household.id,
        ...lesson,
      },
    });
  }
  console.log(`  ✅ ${DEFAULT_LESSONS.length} default lessons created`);

  console.log('\n🎉 Seed complete!');
  console.log(`   Join code: ${joinCode}`);
  console.log('   Parent login: name="Parent", PIN="1234"');
  console.log('   Kid login:    name="Alex",   PIN="0000"');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
