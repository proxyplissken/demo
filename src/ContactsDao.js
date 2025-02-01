export default class ContactsDao {
    constructor() {
      if (ContactsDao.instance) {
        return ContactsDao.instance;
      }
  
      ContactsDao.instance = this;
      this.init();
    }

    init() {
        const request = indexedDB.open("TakeHomeDatabase", 1);
        request.onerror = (event) => {
            console.error("failed to open db");
        };
        request.onsuccess = (event) => {
            console.log("success opening db");
            this.db = event.target.result;
        };
    
        request.onupgradeneeded = async (event) => {
            console.log('upgrade');
            const db = event.target.result;
            const objectStore = db.createObjectStore("contacts", { autoIncrement: true });
            try {
                await objectStore.add({'test': 'test'});
                let query = objectStore.getAll();
                query.onsuccess = (e) => {
                    console.log(query.result);
                }
                
            } catch(e){
                console.log(e);
            }
        }
    }

    addContact(contact) {
        return;
    }
}