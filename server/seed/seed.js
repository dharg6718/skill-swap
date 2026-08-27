const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Skill = require('../models/Skill');
const SwapRequest = require('../models/SwapRequest');
const Session = require('../models/Session');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const connectDB = require('../config/db');

const skillsData = [
  { name: 'JavaScript', category: 'Programming' },
  { name: 'Python', category: 'Programming' },
  { name: 'Java', category: 'Programming' },
  { name: 'C++', category: 'Programming' },
  { name: 'TypeScript', category: 'Programming' },
  { name: 'Go', category: 'Programming' },
  { name: 'Rust', category: 'Programming' },
  { name: 'React', category: 'Frontend' },
  { name: 'Angular', category: 'Frontend' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'HTML/CSS', category: 'Frontend' },
  { name: 'Svelte', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Django', category: 'Backend' },
  { name: 'Spring Boot', category: 'Backend' },
  { name: 'Express.js', category: 'Backend' },
  { name: 'FastAPI', category: 'Backend' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MySQL', category: 'Database' },
  { name: 'Redis', category: 'Database' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'Azure', category: 'Cloud' },
  { name: 'Google Cloud', category: 'Cloud' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'CI/CD', category: 'DevOps' },
  { name: 'Git', category: 'DevOps' },
  { name: 'Machine Learning', category: 'AI/ML' },
  { name: 'Deep Learning', category: 'AI/ML' },
  { name: 'NLP', category: 'AI/ML' },
  { name: 'Computer Vision', category: 'AI/ML' },
  { name: 'React Native', category: 'Mobile' },
  { name: 'Flutter', category: 'Mobile' },
  { name: 'Swift', category: 'Mobile' },
  { name: 'Kotlin', category: 'Mobile' },
  { name: 'UI/UX Design', category: 'Design' },
  { name: 'Figma', category: 'Design' },
  { name: 'Adobe XD', category: 'Design' },
  { name: 'Jest', category: 'Testing' },
  { name: 'Selenium', category: 'Testing' },
  { name: 'Cypress', category: 'Testing' },
  { name: 'Technical Writing', category: 'Other' },
  { name: 'Agile/Scrum', category: 'Other' }
];

const seedData = async (isAuto = false) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
      console.log('Database connected.');
    }

    await Skill.deleteMany();
    await User.deleteMany();
    await SwapRequest.deleteMany();
    await Session.deleteMany();
    await Review.deleteMany();
    await Notification.deleteMany();
    console.log('Collections cleared.');

    const createdSkills = await Skill.insertMany(skillsData);
    console.log(`${createdSkills.length} skills created.`);

    const getRandSkills = (count) => {
      const shuffled = [...createdSkills].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count).map(s => s._id);
    };

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('password123', salt);

    const usersToCreate = [
      {
        name: 'Admin User', email: 'admin@skillswap.com', password: adminPassword, role: 'admin',
        bio: 'Platform administrator', location: 'New York',
        skillsKnown: getRandSkills(5), skillsWanted: getRandSkills(2)
      },
      ...Array.from({ length: 8 }).map((_, i) => ({
        name: `User ${i+1}`, email: `user${i+1}@skillswap.com`, password: userPassword, role: 'user',
        bio: `Hi, I am User ${i+1}. I love learning new things.`,
        location: ['New York', 'San Francisco', 'London', 'Bangalore', 'Toronto', 'Berlin', 'Tokyo', 'Sydney'][i],
        skillsKnown: getRandSkills(Math.floor(Math.random() * 3) + 3),
        skillsWanted: getRandSkills(Math.floor(Math.random() * 3) + 2),
        rating: Math.floor(Math.random() * 3) + 3,
        totalReviews: Math.floor(Math.random() * 10)
      }))
    ];

    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`${createdUsers.length} users created.`);

    const requests = [
      { sender: createdUsers[1]._id, receiver: createdUsers[2]._id, offeredSkill: createdUsers[1].skillsKnown[0], requestedSkill: createdUsers[2].skillsKnown[0], status: 'pending', message: 'Would love to swap' },
      { sender: createdUsers[2]._id, receiver: createdUsers[3]._id, offeredSkill: createdUsers[2].skillsKnown[0], requestedSkill: createdUsers[3].skillsKnown[0], status: 'accepted', message: 'Let us swap' },
      { sender: createdUsers[3]._id, receiver: createdUsers[4]._id, offeredSkill: createdUsers[3].skillsKnown[0], requestedSkill: createdUsers[4].skillsKnown[0], status: 'accepted', message: 'Swap please' },
      { sender: createdUsers[4]._id, receiver: createdUsers[5]._id, offeredSkill: createdUsers[4].skillsKnown[0], requestedSkill: createdUsers[5].skillsKnown[0], status: 'rejected', message: 'Hi!' },
      { sender: createdUsers[5]._id, receiver: createdUsers[6]._id, offeredSkill: createdUsers[5].skillsKnown[0], requestedSkill: createdUsers[6].skillsKnown[0], status: 'accepted', message: 'Swap' },
      { sender: createdUsers[6]._id, receiver: createdUsers[7]._id, offeredSkill: createdUsers[6].skillsKnown[0], requestedSkill: createdUsers[7].skillsKnown[0], status: 'pending', message: 'Hello' }
    ];

    const createdRequests = await SwapRequest.insertMany(requests);
    console.log(`${createdRequests.length} swap requests created.`);

    const sessions = [
      { request: createdRequests[1]._id, mentor: createdUsers[2]._id, learner: createdUsers[3]._id, skill: createdUsers[2].skillsKnown[0], scheduledAt: new Date(Date.now() + 86400000), duration: 60, status: 'scheduled' },
      { request: createdRequests[2]._id, mentor: createdUsers[3]._id, learner: createdUsers[4]._id, skill: createdUsers[3].skillsKnown[0], scheduledAt: new Date(Date.now() + 172800000), duration: 45, status: 'scheduled' },
      { request: createdRequests[4]._id, mentor: createdUsers[5]._id, learner: createdUsers[6]._id, skill: createdUsers[5].skillsKnown[0], scheduledAt: new Date(Date.now() - 86400000), duration: 60, status: 'completed' }
    ];

    const createdSessions = await Session.insertMany(sessions);
    console.log(`${createdSessions.length} sessions created.`);

    const reviews = [
      { session: createdSessions[2]._id, reviewer: createdUsers[6]._id, reviewee: createdUsers[5]._id, rating: 5, comment: 'Great mentor!' },
      { session: createdSessions[2]._id, reviewer: createdUsers[5]._id, reviewee: createdUsers[6]._id, rating: 4, comment: 'Good learner.' }
    ];

    await Review.insertMany(reviews);
    console.log(`${reviews.length} reviews created.`);

    const notifications = [
      { user: createdUsers[2]._id, type: 'swap_request', title: 'New Request', message: 'You have a new swap request.' },
      { user: createdUsers[3]._id, type: 'request_accepted', title: 'Request Accepted', message: 'Your swap request was accepted.' },
      { user: createdUsers[6]._id, type: 'review', title: 'New Review', message: 'You received a new review.' }
    ];

    await Notification.insertMany(notifications);
    console.log(`${notifications.length} notifications created.`);

    console.log('Seeding completed successfully!');
    if (!isAuto) process.exit(0);
    return true;
  } catch (err) {
    console.error(err);
    if (!isAuto) process.exit(1);
    return false;
  }
};

if (require.main === module) {
  seedData(false);
}

module.exports = { seedData, skillsData };
