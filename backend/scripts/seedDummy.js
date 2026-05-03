require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Campus  = require('../models/Campus');
const User    = require('../models/User');
const Listing = require('../models/Listing');
const Need    = require('../models/Need');

const IMAGES = {
  electronics:        'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400&q=80',
  textbooks:          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
  'formal-wear':      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80',
  cycles:             'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  'hobby-gear':       'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
  'hostel-essentials':'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
};

const LISTINGS = [
  { title: 'Sony WH-1000XM4 Headphones',       description: 'Barely used, comes with original case and cables. Excellent ANC.',          price: 1200000, category: 'electronics',         condition: 'like-new', type: 'sell' },
  { title: 'Casio fx-991ES Plus Calculator',   description: 'Perfect for engineering exams. All functions working.',                      price:   45000, category: 'electronics',         condition: 'good',     type: 'sell' },
  { title: 'Engineering Mathematics – BS Grewal', description: '6th edition, minor highlights. Essential for 1st & 2nd year.',            price:   35000, category: 'textbooks',           condition: 'good',     type: 'sell' },
  { title: 'Data Structures by Narasimha Karumanchi', description: 'Clean copy, no tears. Great for placements prep.',                    price:   28000, category: 'textbooks',           condition: 'like-new', type: 'sell' },
  { title: 'Formal Blazer – Navy Blue (42)',    description: 'Worn twice for presentations. Dry cleaned and ready.',                      price:   25000, category: 'formal-wear',         condition: 'like-new', type: 'sell' },
  { title: 'White Formal Shirt (L)',            description: 'Brand new, tags intact. Selling because wrong size.',                       price:    8000, category: 'formal-wear',         condition: 'new',      type: 'sell' },
  { title: 'Btwin Rockrider 340 Cycle',         description: '21-speed MTB, well maintained, new tyres fitted last month.',               price:  550000, category: 'cycles',              condition: 'good',     type: 'sell' },
  { title: 'Firefox Trekking Cycle',            description: 'Hybrid city bike, front suspension, great for campus commute.',             price:  480000, category: 'cycles',              condition: 'good',     type: 'sell' },
  { title: 'Acoustic Guitar – Fender CD-60S',  description: 'Perfect for beginners, comes with bag and extra strings.',                  price:  650000, category: 'hobby-gear',          condition: 'good',     type: 'sell' },
  { title: 'Cricket Kit (complete set)',        description: 'Bat, pads, helmet, gloves. Used one season.',                               price:  350000, category: 'hobby-gear',          condition: 'good',     type: 'sell' },
  { title: 'Table Fan – Usha Maxx Air',         description: 'Works perfectly, 3 speed settings. Selling on hostel move-out.',           price:   90000, category: 'hostel-essentials',   condition: 'good',     type: 'sell' },
  { title: 'Induction Cooktop – Philips',       description: '2000W, 8 power levels. All accessories included.',                         price:  120000, category: 'hostel-essentials',   condition: 'like-new', type: 'sell' },

  // Rent listings
  { title: 'GoPro Hero 11 (rent)',              description: 'Available for weekend trips. Includes mounts and extra battery.',           price:   30000, category: 'electronics',         condition: 'like-new', type: 'rent', rentalDeposit: 150000, rentalDurationDays: 30 },
  { title: 'Btwin Cycle – Daily Rental',        description: 'Good condition city cycle. Perfect for campus and nearby errands.',        price:    8000, category: 'cycles',              condition: 'good',     type: 'rent', rentalDeposit:  50000, rentalDurationDays: 30 },
  { title: 'Formal Suit – Black (40/42)',       description: 'Rent for interviews or events. Dry cleaned after each use.',               price:   20000, category: 'formal-wear',         condition: 'like-new', type: 'rent', rentalDeposit: 100000, rentalDurationDays: 7 },
  { title: 'DSLR Canon 1500D (rent)',           description: 'Great for photography projects. Includes 18-55mm kit lens.',               price:   50000, category: 'hobby-gear',          condition: 'good',     type: 'rent', rentalDeposit: 200000, rentalDurationDays: 30 },
];

const NEEDS = [
  { title: 'Need Graphic Calculator for 2 days',   description: 'Casio or any scientific calc for my end-sem exam tomorrow.',           category: 'electronics',       type: 'rent', maxBudget:  10000 },
  { title: 'Looking for OS textbook – Galvin',     description: '9th or 10th edition. Need for 3 weeks during exams.',                  category: 'textbooks',         type: 'rent', maxBudget:  15000 },
  { title: 'Need a cycle for 1 month',             description: 'Daily campus commute from boys hostel. Any decent cycle.',             category: 'cycles',            type: 'rent', maxBudget:  30000 },
  { title: 'Want to buy: laptop stand + hub',      description: 'Preferably adjustable stand + USB-C hub. Budget is flexible.',        category: 'electronics',       type: 'buy',  maxBudget:  80000 },
  { title: 'Need formal blazer for tomorrow',      description: 'Size 40 or 42. Campus recruitment drive. Just for one day.',          category: 'formal-wear',       type: 'rent', maxBudget:   5000 },
  { title: 'Wanted: DBMS book – Navathe',          description: 'Any edition from 5th onwards. Okay to buy or borrow.',                category: 'textbooks',         type: 'buy',  maxBudget:  20000 },
  { title: 'Looking for a guitar to practice',     description: 'Learning basics, need for a month. Any acoustic guitar.',             category: 'hobby-gear',        type: 'rent', maxBudget:  25000 },
  { title: 'Need immersion rod + bucket',          description: 'Just moved into hostel. Looking to buy used ones.',                   category: 'hostel-essentials', type: 'buy',  maxBudget:   8000 },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
  console.log('Connected to MongoDB');

  const campus = await Campus.findOne({ active: true });
  if (!campus) { console.error('No active campus found. Run seed.js first.'); process.exit(1); }

  let seller = await User.findOne({ campus: campus._id });
  if (!seller) { console.error('No user found. Run the app once so the dev user is created.'); process.exit(1); }

  // Clear existing dummy data
  await Listing.deleteMany({ campus: campus._id });
  await Need.deleteMany({ campus: campus._id });
  console.log('Cleared existing listings and needs.');

  const now = new Date();
  const listings = await Listing.insertMany(
    LISTINGS.map((l) => ({
      ...l,
      images: [IMAGES[l.category]],
      seller: seller._id,
      campus: campus._id,
      status: 'active',
    }))
  );
  console.log(`Inserted ${listings.length} listings.`);

  const needs = await Need.insertMany(
    NEEDS.map((n, i) => ({
      ...n,
      postedBy: seller._id,
      campus: campus._id,
      status: 'open',
      // alternate some as expiring soon (< 24h) to show High urgency
      expiresAt: i % 3 === 0
        ? new Date(now.getTime() + 12 * 60 * 60 * 1000)   // 12 hours → High urgency
        : new Date(now.getTime() + 7  * 24 * 60 * 60 * 1000), // 7 days → Normal
    }))
  );
  console.log(`Inserted ${needs.length} needs.`);
  console.log('Done!');
};

run()
  .catch((err) => { console.error(err.message); process.exit(1); })
  .finally(() => mongoose.disconnect());
