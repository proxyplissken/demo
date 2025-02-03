import db from './db';
import MockService from './MockService';

export default class ContactsModel {
    constructor() {
      if (ContactsModel.instance) {
        return ContactsModel.instance;
      }

      this.submissionQueue = [];
      this.updateListeners = [];
      this.mockService = new MockService();
      this.status = "waiting to initialize";
      this.activeRecord = null;
      this.isOnline = undefined;
      this.initted = false;
      ContactsModel.instance = this;
    }

    async init() {
      if(this.initted){
        return;
      }
      this.initted = true;
      this.isOnline = window.navigator.onLine;
      console.log('Model init: ' + (window.navigator.onLine ? 'on' : 'off') + 'line');

      window.addEventListener('online', () => {
        console.log('Now online');
        this.updateOnline(true);
        this.retrySync();
      });
      window.addEventListener('offline', () => {
        console.log('Now offline');
        this.updateOnline(false);
        this.submissionQueue = [];
      });
      this.retrySync();
    }

    async tryQueue() {
      if(!this.activeRecord) {
        if(this.submissionQueue.length > 0){
          const record = this.submissionQueue.pop();
          this.sync(record);
        } else {
          this.updateStatus('idle');
        }
      }
    }

    async retrySync() {
      const contacts = await db.contacts.toArray();
      this.submissionQueue = contacts.filter(contact => {
        return contact.status === 'queued' || contact.status === 'failed';
      });
      this.tryQueue();
    }

    isOnline() {
      return this.isOnline;
    }

    async getContacts() {
      return await db.contacts.reverse().toArray();
    }

    async sync(record) {
      if(this.isOnline){
        this.updateStatus(`submitting ${record.name}, ${record.email}`);
        this.updateActiveRecord(record);
        const result = await this.mockService.submit(record);
        let newStatus = 'queued';
        switch(result){
          case 'failure':
            newStatus = 'failed';
            break;
          case 'success':
            newStatus = 'synced';
            break;
          default:
        }
        console.log('update db after sync');
        console.log(record);
        db.contacts.update(record.id, {status:newStatus});
        this.updateStatus(result === 'success' ? 'synced successfully' : 'failed to sync');
        this.updateListenersWithContacts();
        setTimeout(()=> {
          this.updateActiveRecord(null);
          this.tryQueue();
        }, 1000);
      } else {
        this.updateStatus(`${record.name}, ${record.email} is queued for submission once online`);
      }
    }

    async submit(name, email) {
      this.updateStatus(`storing ${name}, ${email}`);
      const status = 'queued';
      try {
          const id =  await db.contacts.add({
              name,
              email,
              status,
          });
          this.submissionQueue.push({id, name, email, status});
          this.tryQueue();
        } catch (error) {
          this.updateStatus(`Failed to save ${name} ${email} in db for queueing`);
          console.log(`Failed to save ${name} ${email} in db for queueing`);
      }
      
      await this.updateListenersWithContacts();
    }

    async clear() {
      this.submissionQueue = [];
      await db.contacts.clear();
      await this.updateListenersWithContacts();
    }

    addListener(listenerFunction) {
      this.updateListeners.push(listenerFunction);
    }

    async updateListenersWithContacts() {
      let contacts = await db.contacts.reverse().toArray();
      for(let i=0; i<this.updateListeners.length; i++){
        this.updateListeners[i]['contacts'](contacts);
      }
    }

    updateActiveRecord(record) {
      this.activeRecord = record;
      for(let i=0; i<this.updateListeners.length; i++){
        this.updateListeners[i]['activeRecord'](record?.id);
      }
    }

    updateStatus(status){
      this.status = status;
      for(let i=0; i<this.updateListeners.length; i++){
        this.updateListeners[i]['status'](status);
      }
    }

    updateOnline(onLine){
      this.isOnline = onLine;
      for(let i=0; i<this.updateListeners.length; i++){
        this.updateListeners[i]['feedback'](onLine);
      }
    }

    removeListener(listenerFunction) {
      //TODO
    }
}