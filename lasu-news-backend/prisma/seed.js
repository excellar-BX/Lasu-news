require('dotenv/config')
const { PrismaClient } = require("../src/generated/prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const bcrypt = require('bcryptjs');

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

console.log('Loading PrismaClient...');
const prisma = new PrismaClient({ adapter });

console.log('Seed script started...');

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lasu.edu' },
    update: {},
    create: {
      email: 'admin@lasu.edu',
      password: hashedPassword,
      name: 'LASU Admin',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Sample posts
  const posts = [
    {
      title: 'Record-Breaking Performance Leads LASU Students To Victory At National Championship',
      slug: 'record-breaking-performance-leads-lasu-students-to-victory-at-national-championship',
      content: 'LASU students showcased exceptional performance at the recently concluded National Championship, bringing home the gold medal in a stunning display of athletic prowess and teamwork.',
      excerpt: 'LASU students showcased exceptional performance at the recently concluded National Championship, bringing home the gold medal.',
      coverImage: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=900&auto=format&fit=crop',
      category: 'Sports',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'LASU Senate Approves New Student Welfare Policy',
      slug: 'lasu-senate-approves-new-student-welfare-policy',
      content: 'The LASU Senate has unanimously approved a comprehensive student welfare policy aimed at improving the overall well-being of students.',
      excerpt: 'The LASU Senate has unanimously approved a comprehensive student welfare policy aimed at improving student well-being.',
      coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&auto=format&fit=crop',
      category: 'Campus',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Student Union Election Results Released — New Leaders Emerge',
      slug: 'student-union-election-results-released-new-leaders-emerge',
      content: 'The highly anticipated Student Union election results have been released, announcing new leadership for the upcoming academic year.',
      excerpt: 'The highly anticipated Student Union election results have been released, announcing new leadership for the upcoming academic year.',
      coverImage: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=400&auto=format&fit=crop',
      category: 'Politics',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'LASU Launches New Digital Library Platform for Students',
      slug: 'lasu-launches-new-digital-library-platform-for-students',
      content: 'LASU has launched a state-of-the-art digital library platform that provides students with access to millions of academic resources, journals, and research materials.',
      excerpt: 'LASU has launched a state-of-the-art digital library platform that provides students with access to millions of academic resources.',
      coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&auto=format&fit=crop',
      category: 'General',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Faculty of Engineering Students Showcase Innovative Robotics Project',
      slug: 'faculty-of-engineering-students-showcase-innovative-robotics-project',
      content: 'Engineering students from LASU have developed an innovative robotics project that has garnered attention from industry experts.',
      excerpt: 'Engineering students from LASU have developed an innovative robotics project that has garnered attention from industry experts.',
      coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop',
      category: 'Campus',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Cultural Festival Highlights Diversity Through Food and Performances',
      slug: 'cultural-festival-highlights-diversity-through-food-and-performances',
      content: 'The annual LASU Cultural Festival celebrated the rich diversity of the student body through traditional foods, music, dance performances, and art exhibitions.',
      excerpt: 'The annual LASU Cultural Festival celebrated the rich diversity of the student body through traditional foods, music, and dance.',
      coverImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&auto=format&fit=crop',
      category: 'General',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'LASU Sports Team Qualifies for National Inter-University Games',
      slug: 'lasu-sports-team-qualifies-for-national-inter-university-games',
      content: 'LASU\'s sports team has successfully qualified for the prestigious National Inter-University Games after a series of impressive victories in the regional qualifiers.',
      excerpt: 'LASU\'s sports team has successfully qualified for the prestigious National Inter-University Games after impressive regional victories.',
      coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop',
      category: 'Sports',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Art Exhibition Showcases Works from Emerging Local Artists',
      slug: 'art-exhibition-showcases-works-from-emerging-local-artists',
      content: 'LASU hosted an art exhibition featuring works from emerging local artists, providing a platform for creative expression and cultural appreciation.',
      excerpt: 'LASU hosted an art exhibition featuring works from emerging local artists, providing a platform for creative expression.',
      coverImage: 'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=500&auto=format&fit=crop',
      category: 'General',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'International Summit Addresses Climate Change Solutions Worldwide',
      slug: 'international-summit-addresses-climate-change-solutions-worldwide',
      content: 'LASU researchers participated in an international summit focused on developing sustainable solutions to address climate change.',
      excerpt: 'LASU researchers participated in an international summit focused on developing sustainable solutions to address climate change.',
      coverImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&auto=format&fit=crop',
      category: 'Politics',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Tech Company Unveils Latest Smartphone with Advanced Features',
      slug: 'tech-company-unveils-latest-smartphone-with-advanced-features',
      content: 'A leading technology company has unveiled its latest smartphone featuring cutting-edge technology and advanced features.',
      excerpt: 'A leading technology company has unveiled its latest smartphone featuring cutting-edge technology and advanced features.',
      coverImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop',
      category: 'General',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Groundbreaking Research from LASU Department Offers Hope For Medical Advancement',
      slug: 'groundbreaking-research-from-lasu-department-offers-hope-for-medical-advancement',
      content: 'Researchers have revealed promising results from a groundbreaking study that could significantly improve patient outcomes.',
      excerpt: 'Researchers have revealed promising results from a groundbreaking study that could significantly improve patient outcomes.',
      coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop',
      category: 'Campus',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Student Leader Addresses Housing Crisis Affecting Over 2,000 Students',
      slug: 'student-leader-addresses-housing-crisis-affecting-over-2000-students',
      content: 'The Student Union President has addressed the pressing housing crisis affecting over 2,000 LASU students, calling for urgent action from university management.',
      excerpt: 'The Student Union President has addressed the pressing housing crisis affecting over 2,000 LASU students.',
      coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&auto=format&fit=crop',
      category: 'Campus',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'LASU Basketball Team Wins Regional Championship After Thrilling Final',
      slug: 'lasu-basketball-team-wins-regional-championship-after-thrilling-final',
      content: 'The LASU basketball team emerged victorious in the regional championship after a thrilling final match that kept fans on the edge of their seats.',
      excerpt: 'The LASU basketball team emerged victorious in the regional championship after a thrilling final match.',
      coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop',
      category: 'Sports',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Healthy Lifestyle Campaign Launches Across LASU Campus',
      slug: 'healthy-lifestyle-campaign-launches-across-lasu-campus',
      content: 'A comprehensive healthy lifestyle campaign has been launched across the LASU campus to promote physical fitness, mental wellness, and nutritional awareness among students.',
      excerpt: 'A comprehensive healthy lifestyle campaign has been launched across the LASU campus to promote wellness among students.',
      coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop',
      category: 'General',
      published: true,
      authorId: admin.id,
    },
  ];

  // Create posts
  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }

  console.log(`✅ Created ${posts.length} posts`);
  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });