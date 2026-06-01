require('dotenv/config')
const { PrismaClient } = require("@prisma/client");
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

  // Sample posts with new categories
  const posts = [
    // UPDATES - Daily news and announcements
    {
      title: 'LASU Announces New Academic Calendar for 2024/2025 Session',
      slug: 'lasu-announces-new-academic-calendar-2024-2025',
      content: 'The university management has released the official academic calendar for the 2024/2025 session. Lectures are scheduled to commence on September 2nd, 2024, with the first semester examinations set to begin in December. Students are advised to check the official portal for detailed schedules.',
      excerpt: 'LASU releases official academic calendar for 2024/2025 session with lectures starting September 2nd.',
      coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop',
      category: 'UPDATES',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Library Hours Extended for Exam Period',
      slug: 'library-hours-extended-exam-period',
      content: 'In response to student requests, the university library will now operate 24 hours during the examination period. This extension aims to provide students with adequate study time and access to resources. The extended hours will be in effect from November 15th to December 20th.',
      excerpt: 'University library to operate 24 hours during examination period from November 15th to December 20th.',
      coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&auto=format&fit=crop',
      category: 'UPDATES',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Campus Shuttle Service Schedule Update',
      slug: 'campus-shuttle-service-schedule-update',
      content: 'The campus shuttle service has been updated with new routes and extended operating hours. Shuttles will now run from 7:00 AM to 10:00 PM on weekdays, with additional weekend services. New routes include connections to the main gate, faculty buildings, and student hostels.',
      excerpt: 'Campus shuttle service updated with new routes and extended operating hours from 7 AM to 10 PM.',
      coverImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=900&auto=format&fit=crop',
      category: 'UPDATES',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Registration Deadline Extended for First-Year Students',
      slug: 'registration-deadline-extended-first-year-students',
      content: 'Due to technical challenges with the registration portal, the deadline for first-year student registration has been extended by one week. The new deadline is October 15th, 2024. Students who have not completed registration are urged to do so immediately.',
      excerpt: 'First-year student registration deadline extended to October 15th due to portal technical issues.',
      coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop',
      category: 'UPDATES',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'New Cafeteria Menu Launches at Main Campus',
      slug: 'new-cafeteria-menu-launches-main-campus',
      content: 'The university cafeteria has introduced an improved menu with healthier options and diverse cuisines. The new menu includes vegetarian dishes, local delicacies, and affordable meal plans for students. Prices have been reviewed to ensure affordability for all students.',
      excerpt: 'University cafeteria launches improved menu with healthier options and diverse cuisines at affordable prices.',
      coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop',
      category: 'UPDATES',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'WiFi Network Upgrade Completed Across Campus',
      slug: 'wifi-network-upgrade-completed-campus',
      content: 'The university has completed a major upgrade to the campus WiFi network, improving speed and coverage. Students can now access high-speed internet in all lecture halls, libraries, and common areas. The upgrade includes increased bandwidth and better security features.',
      excerpt: 'Campus WiFi network upgraded with improved speed and coverage across all lecture halls and common areas.',
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&auto=format&fit=crop',
      category: 'UPDATES',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Student ID Card Replacement Process Simplified',
      slug: 'student-id-card-replacement-process-simplified',
      content: 'The process for replacing lost or damaged student ID cards has been simplified. Students can now request replacements online through the student portal. Processing time has been reduced from 5 days to 2 days, and the fee has been waived for first-time replacements.',
      excerpt: 'Student ID card replacement process simplified with online requests and reduced processing time to 2 days.',
      coverImage: 'https://images.unsplash.com/photo-1555664424-778a69022365?w=900&auto=format&fit=crop',
      category: 'UPDATES',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Exam Timetable Released for First Semester',
      slug: 'exam-timetable-released-first-semester',
      content: 'The examination timetable for the first semester has been released and is now available on the student portal. Examinations are scheduled to begin on December 2nd and conclude on December 20th. Students are advised to check for any clashes and report them immediately.',
      excerpt: 'First semester examination timetable released with exams running from December 2nd to 20th.',
      coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop',
      category: 'UPDATES',
      published: true,
      authorId: admin.id,
    },

    // TRENDING - Popular discussions and student issues
    {
      title: 'Student Union Calls for Action on Hostel Accommodation Crisis',
      slug: 'student-union-calls-action-hostel-accommodation-crisis',
      content: 'The Student Union Government has issued a statement calling for urgent action from university management regarding the hostel accommodation crisis. Over 3,000 students are currently without accommodation, forcing many to seek housing off-campus at exorbitant rates. The SU demands immediate construction of new hostels.',
      excerpt: 'Student Union demands urgent action as over 3,000 students face hostel accommodation crisis.',
      coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&auto=format&fit=crop',
      category: 'TRENDING',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Students Protest Increase in Tuition Fees',
      slug: 'students-protest-increase-tuition-fees',
      content: 'Hundreds of LASU students gathered at the main gate today to protest the proposed increase in tuition fees for the upcoming academic session. The protest was peaceful, with students carrying placards and chanting slogans. The university management has promised to engage in dialogue with student representatives.',
      excerpt: 'Students peacefully protest proposed tuition fee increase, management promises dialogue.',
      coverImage: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=900&auto=format&fit=crop',
      category: 'TRENDING',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Debate: Should LASU Adopt Semester System or Remain on Session System?',
      slug: 'debate-semester-system-session-system',
      content: 'A heated debate has erupted among students and faculty regarding LASU\'s academic calendar system. While some argue that a semester system would improve academic performance, others believe the current session system is more suitable for the Nigerian context. The university senate is considering the proposal.',
      excerpt: 'Debate continues as university senate considers proposal to switch from session to semester system.',
      coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop',
      category: 'TRENDING',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Campus Security Concerns Rise After Recent Incidents',
      slug: 'campus-security-concerns-rise-recent-incidents',
      content: 'Students have raised concerns about campus security following recent incidents of theft and harassment. The Student Union has called for increased security patrols and better lighting around the campus. University management has assured students that measures are being implemented to address these concerns.',
      excerpt: 'Students demand increased security measures following recent theft and harassment incidents on campus.',
      coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=900&auto=format&fit=crop',
      category: 'TRENDING',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Lecturers Strike Over Unpaid Salaries',
      slug: 'lecturers-strike-unpaid-salaries',
      content: 'The Academic Staff Union of Universities (ASUU) LASU chapter has embarked on a strike action over unpaid salaries. The strike has affected academic activities across all faculties. Students are concerned about the impact on their academic calendar and examination schedules.',
      excerpt: 'ASUU LASU chapter strikes over unpaid salaries, disrupting academic activities across all faculties.',
      coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop',
      category: 'TRENDING',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Social Media Trend: #LASUFreshmanExperience Goes Viral',
      slug: 'social-media-trend-lasufreshmanexperience-viral',
      content: 'The hashtag #LASUFreshmanExperience has been trending on social media as new students share their experiences settling into campus life. From funny orientation stories to complaints about accommodation, the hashtag has garnered thousands of tweets and posts, highlighting both the challenges and excitement of university life.',
      excerpt: '#LASUFreshmanExperience trends on social media as new students share campus experiences.',
      coverImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=900&auto=format&fit=crop',
      category: 'TRENDING',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Controversy Over New Dress Code Policy',
      slug: 'controversy-new-dress-code-policy',
      content: 'The university\'s new dress code policy has sparked controversy among students. The policy prohibits certain types of clothing deemed inappropriate, with violators facing disciplinary action. Students argue that the policy is restrictive and infringes on their freedom of expression, while management maintains it is necessary for maintaining decorum.',
      excerpt: 'New dress code policy sparks controversy as students argue it restricts freedom of expression.',
      coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop',
      category: 'TRENDING',
      published: true,
      authorId: admin.id,
    },

    // OPPORTUNITIES - Internships, scholarships, competitions
    {
      title: 'Google Africa Developer Scholarship Program Now Open for Applications',
      slug: 'google-africa-developer-scholarship-program-applications',
      content: 'Google has opened applications for the 2024 Africa Developer Scholarship Program. The program offers free training in Android, Web, and Cloud development to aspiring developers across Africa. LASU students are encouraged to apply as the program provides mentorship and certification opportunities.',
      excerpt: 'Google Africa Developer Scholarship Program 2024 now open for applications with free training and certification.',
      coverImage: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=900&auto=format&fit=crop',
      category: 'OPPORTUNITIES',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'NNPC/SNEPCo National University Scholarship Programme',
      slug: 'nnpc-snepco-national-university-scholarship-programme',
      content: 'The Nigerian National Petroleum Corporation (NNPC) and SNEPCo have announced their National University Scholarship Programme for the 2024/2025 academic session. The scholarship covers tuition, accommodation, and stipends for eligible students. LASU students in engineering and geosciences are particularly encouraged to apply.',
      excerpt: 'NNPC/SNEPCo announces 2024/2025 National University Scholarship Programme covering tuition and accommodation.',
      coverImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=900&auto=format&fit=crop',
      category: 'OPPORTUNITIES',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Internship Opportunities at Microsoft Nigeria',
      slug: 'internship-opportunities-microsoft-nigeria',
      content: 'Microsoft Nigeria is offering internship opportunities to final-year students in computer science, engineering, and related fields. The 6-month internship program provides hands-on experience working on real projects and mentorship from industry professionals. Applications close on November 30th.',
      excerpt: 'Microsoft Nigeria offers 6-month internship opportunities for final-year students in tech fields.',
      coverImage: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=900&auto=format&fit=crop',
      category: 'OPPORTUNITIES',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Hackathon 2024: LASU Tech Innovation Challenge',
      slug: 'hackathon-2024-lasu-tech-innovation-challenge',
      content: 'LASU is hosting its annual Tech Innovation Hackathon on November 20th. Students are invited to form teams and develop innovative solutions to campus challenges. Winning teams will receive cash prizes, mentorship, and potential internship opportunities with sponsoring tech companies. Registration is free for all LASU students.',
      excerpt: 'LASU Tech Innovation Hackathon 2024 invites students to solve campus challenges with cash prizes and internships.',
      coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&auto=format&fit=crop',
      category: 'OPPORTUNITIES',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'MTN Foundation Scholarship Scheme for Science Students',
      slug: 'mtn-foundation-scholarship-scheme-science-students',
      content: 'The MTN Foundation has launched its scholarship scheme for science and technology students in Nigerian universities. The scholarship provides financial support to 300 students annually, covering tuition and study materials. LASU students in science departments with a CGPA of 3.5 and above are eligible to apply.',
      excerpt: 'MTN Foundation Scholarship Scheme now open for science students with 3.5 CGPA and above.',
      coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900&auto=format&fit=crop',
      category: 'OPPORTUNITIES',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Andela Learning Community Free Tech Training',
      slug: 'andela-learning-community-free-tech-training',
      content: 'Andela has partnered with LASU to offer free technical training through its Learning Community program. The 12-week program covers software development, product design, and data science. No prior experience is required, and successful participants will receive certification and job placement support.',
      excerpt: 'Andela Learning Community offers free 12-week tech training in software development and data science.',
      coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&auto=format&fit=crop',
      category: 'OPPORTUNITIES',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Federal Government Youth Entrepreneurship Support Program',
      slug: 'federal-government-youth-entrepreneurship-support-program',
      content: 'The Federal Government has launched a new youth entrepreneurship support program providing grants and business training to young entrepreneurs. LASU students with innovative business ideas can apply for up to ₦500,000 in funding. The program includes mentorship and business development workshops.',
      excerpt: 'Federal Government launches youth entrepreneurship program with up to ₦500,000 grants for student startups.',
      coverImage: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=900&auto=format&fit=crop',
      category: 'OPPORTUNITIES',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Shell Nigeria Internship Program 2024',
      slug: 'shell-nigeria-internship-program-2024',
      content: 'Shell Nigeria is accepting applications for its 2024 internship program. The program offers undergraduate students the opportunity to gain practical experience in the oil and gas industry. Successful interns may be considered for the Shell Graduate Programme upon graduation. Applications close on December 15th.',
      excerpt: 'Shell Nigeria 2024 internship program offers practical experience in oil and gas industry with graduate program opportunities.',
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&auto=format&fit=crop',
      category: 'OPPORTUNITIES',
      published: true,
      authorId: admin.id,
    },

    // SPOTLIGHT - Student features
    {
      title: 'Student Spotlight: Chidi Okonkwo - From LASU to Silicon Valley',
      slug: 'student-spotlight-chidi-okonkwo-lasu-silicon-valley',
      content: 'Chidi Okonkwo, a 2022 Computer Science graduate from LASU, has secured a position at Google\'s headquarters in Mountain View, California. Despite facing financial challenges during his studies, Chidi excelled academically and participated in numerous coding competitions. His story inspires many LASU students to dream big.',
      excerpt: '2022 Computer Science graduate Chidi Okonkwo secures position at Google headquarters in California.',
      coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop',
      category: 'SPOTLIGHT',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Student Spotlight: Amaka Okafor - LASU\'s Rising Track Star',
      slug: 'student-spotlight-amaka-okafor-lasu-rising-track-star',
      content: 'Amaka Okafor, a 300-level Physical Education student, has broken the national record in the 400m sprint at the recently concluded Nigerian University Games Association (NUGA) competition. Her time of 51.2 seconds has earned her a spot on the national team and potential sponsorship deals.',
      excerpt: '300-level student Amaka Okafor breaks national 400m sprint record at NUGA competition with 51.2 seconds.',
      coverImage: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=900&auto=format&fit=crop',
      category: 'SPOTLIGHT',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Student Spotlight: Tunde Adeleke - Student Union President Making Waves',
      slug: 'student-spotlight-tunde-adeleke-student-union-president',
      content: 'Tunde Adeleke, the current Student Union President, has been recognized for his outstanding leadership and advocacy for student welfare. Under his leadership, the SU has successfully negotiated reduced hostel fees and improved campus security. He has been invited to speak at several national youth conferences.',
      excerpt: 'Student Union President Tunde Adeleke recognized for outstanding leadership and student welfare advocacy.',
      coverImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&auto=format&fit=crop',
      category: 'SPOTLIGHT',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Student Spotlight: Fatima Ibrahim - Creative Writer and Poet',
      slug: 'student-spotlight-fatima-ibrahim-creative-writer-poet',
      content: 'Fatima Ibrahim, a 200-level English Literature student, has published her first poetry collection titled "Echoes of Lagos." Her work, which explores themes of identity, culture, and urban life, has received critical acclaim and is being studied in several Nigerian universities. She also runs a creative writing club on campus.',
      excerpt: '200-level English Literature student Fatima Ibrahim publishes acclaimed poetry collection "Echoes of Lagos."',
      coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&auto=format&fit=crop',
      category: 'SPOTLIGHT',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Student Spotlight: Emeka Nnamdi - Tech Entrepreneur Building Solutions',
      slug: 'student-spotlight-emeka-nnamdi-tech-entrepreneur',
      content: 'Emeka Nnamdi, a 400-level Computer Science student, has founded a successful tech startup that provides affordable solar-powered solutions to rural communities. His company, SolarTech Nigeria, has won multiple innovation awards and secured funding from local investors. He mentors other aspiring entrepreneurs on campus.',
      excerpt: '400-level Computer Science student Emeka Nnamdi founders SolarTech Nigeria, providing solar solutions to rural communities.',
      coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=900&auto=format&fit=crop',
      category: 'SPOTLIGHT',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Student Spotlight: Chioma Eze - Campus Fashion Influencer',
      slug: 'student-spotlight-chioma-eze-campus-fashion-influencer',
      content: 'Chioma Eze, a 300-level Mass Communication student, has built a massive following on social media as a fashion influencer. Her unique style, which blends traditional African fabrics with modern designs, has attracted over 500,000 followers. She recently launched her clothing line and collaborates with major fashion brands.',
      excerpt: '300-level Mass Communication student Chioma Eze builds 500k+ following as fashion influencer with unique African-modern fusion style.',
      coverImage: 'https://images.unsplash.com/photo-1529139574466-a302d2d3f524?w=900&auto=format&fit=crop',
      category: 'SPOTLIGHT',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Student Spotlight: Ibrahim Musa - LASU\'s Chess Champion',
      slug: 'student-spotlight-ibrahim-musa-lasu-chess-champion',
      content: 'Ibrahim Musa, a 100-level Mathematics student, has emerged as the LASU chess champion after defeating the defending champion in a thrilling final match. Ibrahim, who learned chess at age 8, now represents the university in national competitions and teaches chess to primary school children in his community.',
      excerpt: '100-level Mathematics student Ibrahim Musa becomes LASU chess champion and teaches chess to community children.',
      coverImage: 'https://images.unsplash.com/photo-1528873815459-0cd6e320f68b?w=900&auto=format&fit=crop',
      category: 'SPOTLIGHT',
      published: true,
      authorId: admin.id,
    },

    // EVENTS - Faculty events, seminars, dinners, socials
    {
      title: 'LASU Faculty of Science Annual Lecture Series',
      slug: 'lasu-faculty-science-annual-lecture-series',
      content: 'The Faculty of Science is hosting its Annual Lecture Series featuring renowned Professor Adebayo Williams from the University of Ibadan. The lecture, titled "The Future of Scientific Research in Africa," will take place on November 15th at the Main Auditorium. All students and staff are invited to attend.',
      excerpt: 'Faculty of Science Annual Lecture Series features Professor Adebayo Williams on November 15th at Main Auditorium.',
      coverImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&auto=format&fit=crop',
      category: 'EVENTS',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Department of Economics Career Fair 2024',
      slug: 'department-economics-career-fair-2024',
      content: 'The Department of Economics is organizing a Career Fair on November 20th, bringing together top employers from banking, finance, and consulting sectors. Students will have the opportunity to network with recruiters, submit CVs, and learn about internship and graduate trainee programs. Over 30 companies have confirmed participation.',
      excerpt: 'Department of Economics Career Fair 2024 on November 20th with 30+ companies from banking, finance, and consulting sectors.',
      coverImage: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=900&auto=format&fit=crop',
      category: 'EVENTS',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'LASU Alumni Homecoming Dinner',
      slug: 'lasu-alumni-homecoming-dinner',
      content: 'The LASU Alumni Association is hosting its annual Homecoming Dinner on December 5th at the Eko Hotel. The event brings together graduates from different years to reconnect, network, and celebrate their alma mater. This year\'s theme is "Celebrating Excellence, Building the Future." Tickets are available at the alumni office.',
      excerpt: 'LASU Alumni Association hosts annual Homecoming Dinner on December 5th at Eko Hotel with theme "Celebrating Excellence, Building the Future."',
      coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&auto=format&fit=crop',
      category: 'EVENTS',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Student Week 2024: A Week of Activities and Celebration',
      slug: 'student-week-2024-activities-celebration',
      content: 'Student Week 2024 kicks off on November 25th with a week-long celebration featuring various activities including sports competitions, cultural displays, debate competitions, music concerts, and a carnival. The week culminates in a grand finale on December 1st with awards for outstanding students and student organizations.',
      excerpt: 'Student Week 2024 from November 25th to December 1st features sports, cultural displays, debates, concerts, and carnival.',
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&auto=format&fit=crop',
      category: 'EVENTS',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Faculty of Law Moot Court Competition',
      slug: 'faculty-law-moot-court-competition',
      content: 'The Faculty of Law is organizing its annual Moot Court Competition on November 18th. Law students will argue hypothetical cases before a panel of judges comprising legal practitioners and academics. The competition aims to develop practical advocacy skills and prepare students for future legal practice.',
      excerpt: 'Faculty of Law Moot Court Competition on November 18th develops practical advocacy skills for law students.',
      coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=900&auto=format&fit=crop',
      category: 'EVENTS',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'International Students Cultural Night',
      slug: 'international-students-cultural-night',
      content: 'The International Students Association is hosting a Cultural Night on November 22nd to celebrate the diversity of LASU\'s international student community. The event will feature traditional foods, music, dance performances, and fashion shows from different countries represented on campus. All students are welcome to attend this celebration of global culture.',
      excerpt: 'International Students Cultural Night on November 22nd celebrates diversity with food, music, dance, and fashion from different countries.',
      coverImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=900&auto=format&fit=crop',
      category: 'EVENTS',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'LASU Tech Summit 2024',
      slug: 'lasu-tech-summit-2024',
      content: 'The LASU Tech Summit returns for its 5th edition on November 28th, bringing together tech enthusiasts, entrepreneurs, and industry experts. This year\'s summit focuses on "Artificial Intelligence: The Future of Work." Keynote speakers include representatives from Google, Microsoft, and local tech startups. Registration is free for LASU students.',
      excerpt: 'LASU Tech Summit 2024 on November 28th focuses on AI with speakers from Google, Microsoft, and local startups.',
      coverImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=900&auto=format&fit=crop',
      category: 'EVENTS',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Department of Theatre Arts End-of-Year Production',
      slug: 'department-theatre-arts-end-year-production',
      content: 'The Department of Theatre Arts presents its end-of-year production, "The Dance of the Forests" by Wole Soyinka, on December 3rd and 4th. The production features final-year students showcasing their acting, directing, and production design skills. Tickets are available at the departmental office and at the venue.',
      excerpt: 'Department of Theatre Arts presents Wole Soyinka\'s "The Dance of the Forests" on December 3rd and 4th.',
      coverImage: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=900&auto=format&fit=crop',
      category: 'EVENTS',
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