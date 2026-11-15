const mongoose = require('mongoose');
const Course = require('./models/Course');
const User = require('./models/User');
require('dotenv').config();

const courses = [
  {
    title: '3 Months Frontend Development',
    description: 'Fast-track frontend course covering HTML, CSS, JavaScript, and React basics in 3 months.',
    category: 'Web Development',
    price: 0,
    published: true,
    lessons: [
      { title: 'HTML Fundamentals', content: 'Learn HTML structure, tags, forms, and semantic elements.', order: 1 },
      { title: 'CSS Basics & Flexbox', content: 'Styling, box model, flexbox layout, and responsive design.', order: 2 },
      { title: 'JavaScript Essentials', content: 'Variables, functions, DOM manipulation, and events.', order: 3 },
      { title: 'React Introduction', content: 'Components, props, state, and hooks basics.', order: 4 },
      { title: 'Build a Portfolio Project', content: 'Apply all skills to build and deploy a portfolio website.', order: 5 },
    ],
  },
  {
    title: '6 Months Frontend Development',
    description: 'Comprehensive frontend course with HTML, CSS, JavaScript, React, Git, and deployment.',
    category: 'Web Development',
    price: 0,
    published: true,
    lessons: [
      { title: 'HTML & Semantic Web', content: 'Deep dive into HTML5, accessibility, and SEO basics.', order: 1 },
      { title: 'Advanced CSS & Animations', content: 'Grid, animations, transitions, and CSS variables.', order: 2 },
      { title: 'JavaScript Deep Dive', content: 'ES6+, async/await, fetch API, and OOP concepts.', order: 3 },
      { title: 'GitHub & Version Control', content: 'Git workflow, branching, pull requests, and collaboration.', order: 4 },
      { title: 'React Advanced', content: 'Context API, custom hooks, React Router, and performance.', order: 5 },
      { title: 'Tailwind CSS', content: 'Utility-first CSS framework for rapid UI development.', order: 6 },
      { title: 'Deployment & CI/CD', content: 'Deploy apps with Vercel, Netlify, and GitHub Actions.', order: 7 },
      { title: 'Capstone Project', content: 'Build a full-featured frontend application from scratch.', order: 8 },
    ],
  },
  {
    title: '1 Year Full Stack Development',
    description: 'Complete full stack bootcamp: HTML to React on frontend, Node.js, Express, MongoDB on backend.',
    category: 'Web Development',
    price: 0,
    published: true,
    lessons: [
      { title: 'HTML, CSS & JavaScript', content: 'Frontend foundations with modern HTML5 and CSS3.', order: 1 },
      { title: 'GitHub & Collaboration', content: 'Version control, branching strategies, and open source.', order: 2 },
      { title: 'React & State Management', content: 'React ecosystem, Redux Toolkit, and React Query.', order: 3 },
      { title: 'Node.js & Express', content: 'Server-side JavaScript, REST APIs, and middleware.', order: 4 },
      { title: 'MongoDB & Mongoose', content: 'NoSQL database design, CRUD operations, and aggregation.', order: 5 },
      { title: 'Authentication & Security', content: 'JWT, bcrypt, OAuth, and security best practices.', order: 6 },
      { title: 'TypeScript', content: 'Type safety for both frontend and backend development.', order: 7 },
      { title: 'Testing', content: 'Unit testing with Jest, integration tests, and E2E with Playwright.', order: 8 },
      { title: 'DevOps & Cloud', content: 'Docker, AWS basics, and deployment pipelines.', order: 9 },
      { title: 'Full Stack Capstone', content: 'Build and deploy a production-ready full stack application.', order: 10 },
    ],
  },
  {
    title: 'Graphic Designing',
    description: 'Learn graphic design principles, typography, color theory, and tools like Figma and Adobe.',
    category: 'Design',
    price: 0,
    published: true,
    lessons: [
      { title: 'Design Principles', content: 'Balance, contrast, alignment, repetition, and proximity.', order: 1 },
      { title: 'Color Theory', content: 'Color wheel, palettes, psychology of color in design.', order: 2 },
      { title: 'Typography', content: 'Font pairing, hierarchy, readability, and web fonts.', order: 3 },
      { title: 'Figma Basics', content: 'Frames, components, auto-layout, and prototyping.', order: 4 },
      { title: 'Logo Design', content: 'Brand identity, vector graphics, and logo creation process.', order: 5 },
      { title: 'UI/UX Design', content: 'User research, wireframing, and high-fidelity mockups.', order: 6 },
      { title: 'Social Media Graphics', content: 'Designing for Instagram, banners, and marketing materials.', order: 7 },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Find or use first instructor
  let instructor = await User.findOne({ role: 'instructor' });
  if (!instructor) {
    console.log('No instructor found. Please register an instructor account first, then run seed.');
    process.exit(1);
  }

  for (const courseData of courses) {
    const exists = await Course.findOne({ title: courseData.title });
    if (exists) { console.log(`Skipping (exists): ${courseData.title}`); continue; }
    await Course.create({ ...courseData, instructor: instructor._id });
    console.log(`Created: ${courseData.title}`);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
