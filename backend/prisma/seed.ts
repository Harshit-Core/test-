import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const stacks = [
  {
    name: 'MERN Stack',
    description: 'MongoDB, Express.js, React, Node.js - Full JavaScript stack for modern web applications',
    components: ['MongoDB', 'Express.js', 'React', 'Node.js'],
    tags: ['fullstack', 'javascript', 'nosql', 'spa'],
    useCase: 'Real-time applications, social platforms, content management systems',
    teamSize: 'Small to Medium (2-10 developers)',
    budget: 'Low to Medium',
    learningCurve: 'Medium - Easier if already familiar with JavaScript'
  },
  {
    name: 'LAMP Stack',
    description: 'Linux, Apache, MySQL, PHP - Classic stack for traditional web applications',
    components: ['Linux', 'Apache', 'MySQL', 'PHP'],
    tags: ['fullstack', 'traditional', 'sql', 'server-side'],
    useCase: 'Content management systems, e-commerce platforms, business websites',
    teamSize: 'Small to Large (2-50 developers)',
    budget: 'Low',
    learningCurve: 'Easy - Well-documented and beginner-friendly'
  },
  {
    name: 'JAMstack',
    description: 'JavaScript, APIs, Markup - Modern architecture for fast, secure, and scalable sites',
    components: ['JavaScript', 'APIs', 'Markup', 'Static Site Generators', 'CDN'],
    tags: ['frontend', 'static', 'serverless', 'performance'],
    useCase: 'Marketing sites, blogs, documentation sites, landing pages',
    teamSize: 'Small (1-5 developers)',
    budget: 'Very Low',
    learningCurve: 'Easy to Medium'
  },
  {
    name: 'Django Stack',
    description: 'Django, PostgreSQL, Python - Batteries-included framework for rapid development',
    components: ['Django', 'PostgreSQL', 'Python', 'Django REST Framework', 'Celery'],
    tags: ['fullstack', 'python', 'sql', 'rapid-development'],
    useCase: 'Data-driven applications, admin dashboards, REST APIs, SaaS platforms',
    teamSize: 'Small to Medium (2-15 developers)',
    budget: 'Low to Medium',
    learningCurve: 'Medium - Python knowledge required'
  },
  {
    name: 'Serverless Stack',
    description: 'AWS Lambda, API Gateway, DynamoDB - Cloud-native serverless architecture',
    components: ['AWS Lambda', 'API Gateway', 'DynamoDB', 'S3', 'CloudFront'],
    tags: ['serverless', 'cloud', 'scalable', 'aws'],
    useCase: 'Event-driven applications, microservices, APIs, scheduled tasks',
    teamSize: 'Small to Medium (2-10 developers)',
    budget: 'Pay-per-use (can be very low)',
    learningCurve: 'Medium to Hard - Cloud architecture knowledge needed'
  },
  {
    name: 'Ruby on Rails Stack',
    description: 'Ruby on Rails, PostgreSQL - Convention over configuration for rapid prototyping',
    components: ['Ruby on Rails', 'PostgreSQL', 'Redis', 'Sidekiq'],
    tags: ['fullstack', 'ruby', 'sql', 'rapid-prototyping'],
    useCase: 'MVPs, startups, e-commerce, marketplaces',
    teamSize: 'Small to Medium (2-15 developers)',
    budget: 'Low to Medium',
    learningCurve: 'Medium - Ruby conventions to learn'
  },
  {
    name: 'Flutter Mobile Stack',
    description: 'Flutter, Firebase, Dart - Cross-platform mobile development',
    components: ['Flutter', 'Dart', 'Firebase', 'Cloud Firestore', 'FCM'],
    tags: ['mobile', 'cross-platform', 'firebase', 'ios', 'android'],
    useCase: 'Mobile apps, cross-platform applications, real-time apps',
    teamSize: 'Small (1-8 developers)',
    budget: 'Low to Medium',
    learningCurve: 'Medium - Dart and mobile patterns to learn'
  },
  {
    name: 'Next.js Full Stack',
    description: 'Next.js, Prisma, PostgreSQL, TypeScript - Modern full-stack React framework',
    components: ['Next.js', 'Prisma', 'PostgreSQL', 'TypeScript', 'tRPC'],
    tags: ['fullstack', 'typescript', 'react', 'ssr', 'sql'],
    useCase: 'SEO-critical sites, e-commerce, SaaS, dashboards',
    teamSize: 'Small to Medium (2-12 developers)',
    budget: 'Low to Medium',
    learningCurve: 'Medium - TypeScript and React knowledge required'
  },
  {
    name: 'Microservices Stack',
    description: 'Docker, Kubernetes, gRPC, Service Mesh - Distributed systems architecture',
    components: ['Docker', 'Kubernetes', 'gRPC', 'Istio', 'Prometheus', 'Grafana'],
    tags: ['microservices', 'distributed', 'scalable', 'enterprise'],
    useCase: 'Large-scale applications, enterprise systems, high-traffic platforms',
    teamSize: 'Medium to Large (10-100+ developers)',
    budget: 'High',
    learningCurve: 'Hard - Distributed systems expertise required'
  },
  {
    name: 'T3 Stack',
    description: 'Next.js, tRPC, Tailwind CSS, Prisma, TypeScript - Type-safe full-stack',
    components: ['Next.js', 'tRPC', 'Tailwind CSS', 'Prisma', 'TypeScript', 'NextAuth.js'],
    tags: ['fullstack', 'typescript', 'type-safe', 'modern'],
    useCase: 'Type-safe applications, startups, SaaS products, web apps',
    teamSize: 'Small to Medium (1-10 developers)',
    budget: 'Low',
    learningCurve: 'Medium to Hard - Strong TypeScript skills required'
  }
];

async function main() {
  console.log('Starting seed...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@techstack.com' },
    update: {},
    create: {
      email: 'admin@techstack.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      knownSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js']
    }
  });

  console.log(`Admin user created: ${admin.email}`);

  for (const stackData of stacks) {
    await prisma.stack.upsert({
      where: { name: stackData.name },
      update: stackData,
      create: stackData
    });
  }

  console.log(`Seeded ${stacks.length} tech stacks`);
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
