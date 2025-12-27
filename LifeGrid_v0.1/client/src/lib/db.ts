import { openDB, DBSchema } from 'idb';
import { UserSettings, Week } from '@shared/schema';

interface LifeGridDB extends DBSchema {
  settings: {
    key: string;
    value: UserSettings;
  };
  weeks: {
    key: string;
    value: Week;
    indexes: { 'by-index': number };
  };
}

const DB_NAME = 'lifegrid-db';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB<LifeGridDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
      if (!db.objectStoreNames.contains('weeks')) {
        const weeksStore = db.createObjectStore('weeks', { keyPath: 'id' });
        weeksStore.createIndex('by-index', 'weekIndex');
      }
    },
  });
};

export const db = {
  async getSettings(): Promise<UserSettings | undefined> {
    const db = await initDB();
    return db.get('settings', 'user');
  },

  async saveSettings(settings: UserSettings): Promise<UserSettings> {
    const db = await initDB();
    await db.put('settings', settings, 'user');
    return settings;
  },

  async getWeeks(): Promise<Week[]> {
    const db = await initDB();
    return db.getAll('weeks');
  },

  async getWeek(id: string): Promise<Week | undefined> {
    const db = await initDB();
    return db.get('weeks', id);
  },

  async saveWeek(week: Week): Promise<Week> {
    const db = await initDB();
    await db.put('weeks', week);
    return week;
  },
};
