import { PrismaClient, SkillStatus, PricingType, Platform } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@agentfoundry.ai' },
    update: {},
    create: {
      firebaseUid: 'demo-firebase-uid',
      email: 'demo@agentfoundry.ai',
      displayName: 'Demo User',
      bio: 'Demo user for AgentFoundry',
      verified: true,
      reputation: 100,
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create demo skills
  const weatherSkill = await prisma.skill.upsert({
    where: { slug: 'weather-forecast' },
    update: {},
    create: {
      name: 'Weather Forecast',
      slug: 'weather-forecast',
      description: 'Get accurate weather forecasts for any location',
      longDescription:
        'This skill provides real-time weather information and forecasts using multiple weather APIs.',
      category: 'Utilities',
      tags: ['weather', 'forecast', 'api'],
      version: '1.0.0',
      authorId: demoUser.id,
      status: SkillStatus.APPROVED,
      platforms: [Platform.CLAUDE_SKILLS, Platform.MCP],
      manifestUrl: 'https://example.com/weather-forecast.json',
      pricingType: PricingType.FREE,
      permissions: ['network.http', 'location.read'],
      safetyScore: 0.95,
      rating: 4.5,
      reviewCount: 10,
      downloads: 150,
      publishedAt: new Date(),
    },
  });

  console.log('✅ Created skill:', weatherSkill.name);

  const emailSkill = await prisma.skill.upsert({
    where: { slug: 'email-assistant' },
    update: {},
    create: {
      name: 'Email Assistant',
      slug: 'email-assistant',
      description: 'Draft and send emails intelligently',
      longDescription:
        'AI-powered email composition and sending with smart templates and scheduling.',
      category: 'Productivity',
      tags: ['email', 'communication', 'productivity'],
      version: '1.2.0',
      authorId: demoUser.id,
      status: SkillStatus.APPROVED,
      platforms: [Platform.CLAUDE_SKILLS, Platform.GPT_ACTIONS],
      manifestUrl: 'https://example.com/email-assistant.json',
      pricingType: PricingType.FREEMIUM,
      permissions: ['email.send', 'email.read', 'network.http'],
      safetyScore: 0.88,
      rating: 4.8,
      reviewCount: 25,
      downloads: 320,
      publishedAt: new Date(),
    },
  });

  console.log('✅ Created skill:', emailSkill.name);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
