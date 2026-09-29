import bcrypt from 'bcryptjs';
import db from './database';

export function seedIfEmpty(): void {
  const listingCount = db.prepare('SELECT COUNT(*) as count FROM listings').get() as { count: number };
  if (listingCount && listingCount.count > 0) {
    return;
  }

  console.log('🌱 Seeding CampusSwap database with demo data...');

  const passwordHash = bcrypt.hashSync('campus123', 10);

  // Insert demo users (or ignore if already exists)
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password_hash, hostel, batch)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run('Arjun Sharma', 'arjun@campus.edu', passwordHash, 'Hostel 4, Room 212', 'Batch of 2025');
  insertUser.run('Priya Patel', 'priya@campus.edu', passwordHash, 'Hostel 7, Room 104', 'Batch of 2026');
  insertUser.run('Rahul Verma', 'rahul@campus.edu', passwordHash, 'Hostel 2, Room 318', 'Batch of 2024');
  insertUser.run('Ananya Iyer', 'ananya@campus.edu', passwordHash, 'Hostel 5, Room 402', 'Batch of 2025');

  const getUserId = (email: string) => {
    const row = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: number };
    return row.id;
  };

  const u1Id = getUserId('arjun@campus.edu');
  const u2Id = getUserId('priya@campus.edu');
  const u3Id = getUserId('rahul@campus.edu');
  const u4Id = getUserId('ananya@campus.edu');

  // Insert demo listings
  const insertListing = db.prepare(`
    INSERT INTO listings (seller_id, title, description, category, course, semester, condition, mode, price, rent_price_per_week, swap_wanted, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertListing.run(
    u1Id,
    'Introduction to Algorithms (CLRS) 4th Edition',
    'Standard textbook for CS201. Barely used, no pen marks or highlighting. Essential for DSA exams and placements.',
    'book',
    'CS201',
    'Semester 3',
    'good',
    'sell',
    650,
    null,
    null,
    'available'
  );

  insertListing.run(
    u2Id,
    'Casio fx-991EX ClassWiz Scientific Calculator',
    'Approved for all university math and engineering examinations. Available for weekly rent during mid-terms and finals.',
    'calculator',
    'MA101',
    'Semester 1',
    'new',
    'rent',
    null,
    60,
    null,
    'available'
  );

  insertListing.run(
    u3Id,
    'Data Structures & Algorithms Comprehensive Handwritten Notes',
    'Complete lecture notes from Prof. Rao\'s course. Includes all tree, graph, DP problem walkthroughs with color-coded diagrams.',
    'notes',
    'CS201',
    'Semester 3',
    'good',
    'sell',
    180,
    null,
    null,
    'available'
  );

  insertListing.run(
    u4Id,
    'Chemistry & Physics Lab Coat + Protective Goggles Kit',
    '100% white cotton lab coat (size M/L) plus UV-rated safety goggles. Mandatory for Chemistry & Materials labs.',
    'lab-equipment',
    'CH101',
    'Semester 1',
    'good',
    'swap',
    null,
    null,
    'Digital Multimeter or Breadboard with components',
    'available'
  );

  insertListing.run(
    u1Id,
    'Digital Design by M. Morris Mano & Michael D. Ciletti (5th Ed)',
    'Covers Boolean logic, flip-flops, sequential circuits, and Verilog HDL. Clean pages with minimal pencil underlines.',
    'book',
    'EE204',
    'Semester 4',
    'fair',
    'sell',
    340,
    null,
    null,
    'available'
  );

  insertListing.run(
    u2Id,
    'TI-84 Plus CE Color Graphing Calculator',
    'High-resolution backlit color screen with rechargeable battery. Perfect for advanced statistics and linear algebra.',
    'calculator',
    'MA202',
    'Semester 4',
    'good',
    'rent',
    null,
    120,
    null,
    'available'
  );

  insertListing.run(
    u3Id,
    'Signals and Systems by Alan V. Oppenheim & Alan S. Willsky',
    'Classic reference book for Signals & Systems. Hardcover edition in pristine condition.',
    'book',
    'EE201',
    'Semester 4',
    'new',
    'sell',
    750,
    null,
    null,
    'available'
  );

  insertListing.run(
    u4Id,
    'Electronics Lab Starter Kit: Breadboard, Resistors, ICs & Wires',
    'Complete lab kit containing 830-point solderless breadboard, 555 timers, 7400 series logic gates, and jumper cables.',
    'lab-equipment',
    'EE101',
    'Semester 2',
    'new',
    'sell',
    420,
    null,
    null,
    'available'
  );

  // Insert demo requests
  const insertRequest = db.prepare(`
    INSERT INTO requests (user_id, title, course, semester, note, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertRequest.run(
    u2Id,
    'Looking for Microelectronic Circuits by Sedra & Smith (7th or 8th Ed)',
    'EE202',
    'Semester 4',
    'Need urgently for mid-term prep! Willing to buy or rent for 2 weeks.',
    'open'
  );

  insertRequest.run(
    u1Id,
    'Urgent: Casio fx-991EX or CW for Calculus exam on Friday',
    'MA101',
    'Semester 1',
    'Left my calculator at home during the break. Need for 3 days, can pay weekly rent.',
    'open'
  );

  insertRequest.run(
    u4Id,
    'Computer Networks (5th Edition) by Tanenbaum & Wetherall',
    'CS401',
    'Semester 6',
    'Looking to buy or swap for OS Dinosaur book.',
    'open'
  );

  console.log('✅ Demo data seeded successfully (4 users, 8 listings, 3 requests). Demo logins: arjun@campus.edu, priya@campus.edu, rahul@campus.edu (password: campus123)');
}
