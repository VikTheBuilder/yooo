import bcrypt from 'bcryptjs';
import db from './database';

const DEMO_PASSWORD = 'demo1234';

const demoUsers = [
  { name: 'Aarav Mehta', email: 'aarav@campus.edu', hostel: 'Block A', batch: '2025' },
  { name: 'Ananya Rao', email: 'ananya@campus.edu', hostel: 'Block B', batch: '2026' },
  { name: 'Kabir Shah', email: 'kabir@campus.edu', hostel: 'Block C', batch: '2027' },
  { name: 'Meera Nair', email: 'meera@campus.edu', hostel: 'Block A', batch: '2028' },
  { name: 'Ishaan Gupta', email: 'ishaan@campus.edu', hostel: 'Block B', batch: '2025' },
  { name: 'Sara Fernandes', email: 'sara@campus.edu', hostel: 'Block C', batch: '2027' },
];

type DemoListing = {
  key: string;
  seller: string;
  title: string;
  description: string;
  category: 'book' | 'notes' | 'calculator' | 'lab-equipment' | 'other';
  course: string;
  semester: number;
  condition: 'new' | 'good' | 'fair';
  mode: 'sell' | 'rent' | 'swap';
  price?: number;
  weeklyRent?: number;
  swapWanted?: string;
  status?: 'available' | 'sold' | 'rented' | 'swapped';
};

const demoListings: DemoListing[] = [
  { key: 'clrs', seller: 'aarav', title: 'Introduction to Algorithms (CLRS)', description: 'Fourth edition, clean copy with a few pencil notes in the margins. Great for DSA and algorithms.', category: 'book', course: 'CS301', semester: 5, condition: 'good', mode: 'sell', price: 450 },
  { key: 'grewal', seller: 'ananya', title: 'Engineering Mathematics - B.S. Grewal', description: 'Latest edition with intact binding and worked examples marked for calculus and transforms.', category: 'book', course: 'MA101', semester: 1, condition: 'good', mode: 'sell', price: 380 },
  { key: 'tanenbaum', seller: 'kabir', title: 'Computer Networks (Tanenbaum)', description: 'Sixth edition, lightly used. Happy to swap for a DSA or operating systems book.', category: 'book', course: 'CS402', semester: 6, condition: 'good', mode: 'swap', swapWanted: 'A DSA or operating systems book', status: 'swapped' },
  { key: 'clean-code', seller: 'meera', title: 'Clean Code by Robert C. Martin', description: 'Paperback in very good shape, useful for software engineering projects.', category: 'book', course: 'CS401', semester: 7, condition: 'good', mode: 'sell', price: 300 },
  { key: 'physics-book', seller: 'ishaan', title: 'Concepts of Physics, Volume 1', description: 'Clear pages and sturdy binding. Available for the semester or exam revision.', category: 'book', course: 'PH101', semester: 1, condition: 'fair', mode: 'rent', weeklyRent: 45 },
  { key: 'dsa-notes', seller: 'sara', title: 'DSA handwritten notes', description: 'Neat, complete notes covering trees, graphs, sorting, and common interview problems.', category: 'notes', course: 'CS201', semester: 3, condition: 'good', mode: 'sell', price: 50 },
  { key: 'dbms-notes', seller: 'aarav', title: 'DBMS notes', description: 'Concise revision notes for normalization, SQL, transactions, and indexing.', category: 'notes', course: 'CS302', semester: 5, condition: 'new', mode: 'sell', price: 50 },
  { key: 'os-notes', seller: 'ananya', title: 'Operating Systems exam notes', description: 'Process scheduling, memory management, file systems, and solved past questions.', category: 'notes', course: 'CS303', semester: 5, condition: 'good', mode: 'swap', swapWanted: 'Signals and systems notes' },
  { key: 'discrete-notes', seller: 'kabir', title: 'Discrete Mathematics summary sheets', description: 'Set of ten quick-reference sheets for logic, proofs, graphs, and combinatorics.', category: 'notes', course: 'MA202', semester: 2, condition: 'good', mode: 'sell', price: 35 },
  { key: 'circuit-notes', seller: 'meera', title: 'Digital Logic handwritten notes', description: 'Color-coded notes with K-maps, counters, flip-flops, and circuit examples.', category: 'notes', course: 'EE204', semester: 4, condition: 'fair', mode: 'sell', price: 40 },
  { key: 'casio-rent', seller: 'ishaan', title: 'Casio fx-991EX scientific calculator', description: 'Fully working, exam-approved calculator. Includes hard case and fresh battery.', category: 'calculator', course: 'MA101', semester: 1, condition: 'good', mode: 'rent', weeklyRent: 30 },
  { key: 'casio-sale', seller: 'sara', title: 'Casio fx-991CW ClassWiz', description: 'Newer ClassWiz model, reset and ready for exams. Includes original case.', category: 'calculator', course: 'MA201', semester: 3, condition: 'new', mode: 'sell', price: 950 },
  { key: 'ti-rent', seller: 'aarav', title: 'TI-36X Pro calculator', description: 'Reliable scientific calculator for engineering math and statistics.', category: 'calculator', course: 'MA301', semester: 6, condition: 'good', mode: 'rent', weeklyRent: 40 },
  { key: 'arduino', seller: 'ananya', title: 'Arduino starter kit', description: 'Uno-compatible board, USB cable, breadboard, LEDs, sensors, and jumper wires.', category: 'lab-equipment', course: 'EE101', semester: 2, condition: 'good', mode: 'sell', price: 550 },
  { key: 'digital-kit', seller: 'kabir', title: 'Digital Logic lab kit', description: 'Breadboard, 7400-series ICs, logic probes, switches, and component box for lab sessions.', category: 'lab-equipment', course: 'EE204', semester: 4, condition: 'good', mode: 'sell', price: 420 },
  { key: 'multimeter', seller: 'meera', title: 'UNI-T digital multimeter', description: 'Tested multimeter with leads, suitable for circuits and electronics labs.', category: 'lab-equipment', course: 'EE302', semester: 6, condition: 'good', mode: 'rent', weeklyRent: 70 },
  { key: 'breadboard-swap', seller: 'ishaan', title: 'Breadboard and component bundle', description: 'Large breadboard with resistors, capacitors, LEDs, and jumper wires.', category: 'lab-equipment', course: 'EE102', semester: 2, condition: 'fair', mode: 'swap', swapWanted: 'A basic Arduino-compatible board' },
  { key: 'pi-kit', seller: 'sara', title: 'Raspberry Pi 4 lab bundle', description: 'Raspberry Pi 4 with power supply, case, and 32 GB card. Great for embedded systems.', category: 'lab-equipment', course: 'CS405', semester: 7, condition: 'good', mode: 'sell', price: 3200 },
  { key: 'drawing-tools', seller: 'aarav', title: 'Engineering drawing instrument set', description: 'Compass, divider, set squares, and scale in a compact case.', category: 'other', course: 'ME101', semester: 1, condition: 'good', mode: 'sell', price: 180 },
  { key: 'soldering-iron', seller: 'ananya', title: 'Temperature-controlled soldering iron', description: 'Working soldering iron with stand and spare tips for project work.', category: 'other', course: 'EE401', semester: 8, condition: 'fair', mode: 'sell', price: 600, status: 'sold' },
];

const demoRequests = [
  { user: 'kabir', title: 'Looking for a second-hand DSA textbook', course: 'CS301', semester: 5, note: 'CLRS or another algorithms text is fine; hoping to find one before midterms.' },
  { user: 'meera', title: 'Need a scientific calculator for exams', course: 'MA101', semester: 1, note: 'Would prefer a Casio fx-991EX or CW for next week.' },
  { user: 'ishaan', title: 'Digital Logic lab kit or IC set', course: 'EE204', semester: 4, note: 'Looking for a kit with 7400-series gates and a working breadboard.' },
  { user: 'sara', title: 'DBMS notes with SQL examples', course: 'CS302', semester: 5, note: 'Especially interested in joins, normalization, and transaction schedules.' },
  { user: 'aarav', title: 'Engineering drawing instrument set', course: 'ME101', semester: 1, note: 'Compass and set squares needed for the next studio class.' },
  { user: 'ananya', title: 'Computer Networks textbook', course: 'CS402', semester: 6, note: 'Tanenbaum preferred; open to buying or swapping for my OS notes.' },
];

function insertDemoData(): void {
  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const userIds = new Map<string, number>();
  const listingIds = new Map<string, number>();

  const addUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, hostel, batch)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const user of demoUsers) {
    const result = addUser.run(user.name, user.email, passwordHash, user.hostel, user.batch);
    userIds.set(user.email.split('@')[0], Number(result.lastInsertRowid));
  }

  const addListing = db.prepare(`
    INSERT INTO listings
      (seller_id, title, description, category, course, semester, condition, mode,
       price, rent_price_per_week, swap_wanted, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const listing of demoListings) {
    const result = addListing.run(
      userIds.get(listing.seller)!, listing.title, listing.description, listing.category,
      listing.course, `Semester ${listing.semester}`, listing.condition, listing.mode,
      listing.price ?? null, listing.weeklyRent ?? null, listing.swapWanted ?? null,
      listing.status ?? 'available',
    );
    listingIds.set(listing.key, Number(result.lastInsertRowid));
  }

  const addRequest = db.prepare(`
    INSERT INTO requests (user_id, title, course, semester, note, status)
    VALUES (?, ?, ?, ?, ?, 'open')
  `);
  for (const request of demoRequests) {
    addRequest.run(
      userIds.get(request.user)!, request.title, request.course,
      `Semester ${request.semester}`, request.note,
    );
  }

  const addTransaction = db.prepare(`
    INSERT INTO transactions (listing_id, buyer_id, seller_id, type, status, due_date, created_at)
    VALUES (?, ?, ?, ?, 'completed', ?, datetime('now', ?))
  `);
  const deals = [
    { listing: 'soldering-iron', buyer: 'sara', seller: 'ananya', type: 'sale', dueDate: null, daysAgo: '-9 days' },
    { listing: 'casio-rent', buyer: 'meera', seller: 'ishaan', type: 'rent', dueDate: null, daysAgo: '-6 days' },
    { listing: 'tanenbaum', buyer: 'aarav', seller: 'kabir', type: 'swap', dueDate: null, daysAgo: '-3 days' },
  ] as const;

  for (const deal of deals) {
    addTransaction.run(
      listingIds.get(deal.listing)!, userIds.get(deal.buyer)!, userIds.get(deal.seller)!,
      deal.type, deal.dueDate, deal.daysAgo,
    );
  }
}

export function seedDemoData(): void {
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec('DELETE FROM transactions; DELETE FROM requests; DELETE FROM listings; DELETE FROM users;');
    insertDemoData();
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  printCredentials();
}

export function seedIfEmpty(): void {
  const row = db.prepare('SELECT COUNT(*) AS count FROM listings').get() as { count: number };
  if (row.count > 0) return;

  db.exec('BEGIN IMMEDIATE');
  try {
    insertDemoData();
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  console.log('CampusSwap demo data seeded.');
}

function printCredentials(): void {
  console.log('CampusSwap demo data seeded: 6 users, 20 listings, 6 open requests, 3 completed deals.');
  console.log(`Demo login password for all accounts: ${DEMO_PASSWORD}`);
  for (const user of demoUsers) console.log(`  ${user.email}`);
}
