// Demo data seeder. Run with: npm run seed  (from /server)
// Destroy demo data with: npm run seed:destroy
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Property = require('../models/Property');

const demoUsers = [
  {
    name: 'Eric Mugisha',
    username: 'ericm',
    email: 'eric.owner@kigalihomes.test',
    phone: '+250780000001',
    password: 'password123',
    role: 'owner',
  },
  {
    name: 'Aline Uwase',
    username: 'alineu',
    email: 'aline.seeker@kigalihomes.test',
    phone: '+250780000002',
    password: 'password123',
    role: 'seeker',
  },
];

const locations = ['Kiyovu', 'Kimihurura', 'Remera', 'Kacyiru', 'Nyarutarama', 'Gisozi', 'Kicukiro', 'Kanombe'];
const types = ['house', 'apartment', 'villa', 'commercial', 'plot'];

const heroImages = [
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
];

const run = async () => {
  await connectDB();

  const destroy = process.argv.includes('--destroy');

  if (destroy) {
    await Property.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } });
    console.log('Demo properties and non-admin users removed.');
    process.exit(0);
  }

  console.log('Seeding demo data...');

  const createdUsers = [];
  for (const u of demoUsers) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      createdUsers.push(exists);
      continue;
    }
    const user = await User.create(u);
    createdUsers.push(user);
  }

  const owner = createdUsers.find((u) => u.role === 'owner');

  const existingCount = await Property.countDocuments();
  if (existingCount === 0) {
    const demoProperties = Array.from({ length: 18 }).map((_, i) => ({
      title: `${types[i % types.length].charAt(0).toUpperCase() + types[i % types.length].slice(1)} in ${locations[i % locations.length]}`,
      description:
        'A well-located, comfortable property with easy access to main roads, shops, and schools. Perfect for families or professionals.',
      purpose: i % 2 === 0 ? 'rent' : 'sale',
      propertyType: types[i % types.length],
      price: i % 2 === 0 ? 200000 + i * 15000 : 45000000 + i * 2500000,
      location: locations[i % locations.length],
      address: `KG ${100 + i} St, ${locations[i % locations.length]}, Kigali`,
      bedrooms: (i % 5) + 1,
      bathrooms: (i % 3) + 1,
      size: 100 + i * 10,
      furnished: i % 2 === 0,
      amenities: ['Parking', 'Water Tank', 'Security', 'Wi-Fi'].slice(0, (i % 4) + 1),
      images: [`${heroImages[i % heroImages.length]}?auto=format&fit=crop&w=1200&q=80`],
      contactPhone: '+250780000001',
      owner: owner._id,
      status: 'approved',
      isFeatured: i % 4 === 0,
      isVerified: i % 3 === 0,
    }));

    await Property.insertMany(demoProperties);
    console.log(`Inserted ${demoProperties.length} demo properties.`);
  } else {
    console.log('Properties already exist, skipping property seed.');
  }

  console.log('Demo credentials:');
  console.log('  Owner  -> eric.owner@kigalihomes.test / password123');
  console.log('  Seeker -> aline.seeker@kigalihomes.test / password123');
  console.log('Note: no admin account is seeded. Register the first admin at /admin/register.');

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
