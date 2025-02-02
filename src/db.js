// db.js
import Dexie from 'dexie';

const db = new Dexie('takehomedb');
db.version(1).stores({
    contacts: '++id, name, email'
});
db.version(2).stores({
    contacts: '++id, name, email, status'
})

export default db;