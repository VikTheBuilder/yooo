import db, { initDb } from './database';
import { seedDemoData } from './seed';

try {
  initDb();
  seedDemoData();
} finally {
  db.close();
}
