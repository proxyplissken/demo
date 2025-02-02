import db from './db';
import MockService from './MockService';

export default class ContactsModel {
    constructor() {
      if (ContactsModel.instance) {
        return ContactsModel.instance;
      }

      this.contacts = [];
      this.submissionQueue = [];
      this.updateListeners = [];
      this.mockService = new MockService();
      this.status = "waiting to initialize";
      this.activeRecord = null;
      ContactsModel.instance = this;
    }

    async init() {
      this.contacts = await db.contacts.reverse().toArray();
      
      this.submissionQueue = this.contacts.filter(contact => {
        return contact.status === 'queued' || contact.status === 'failed';
      })
      
      console.log('queued')
      console.log(this.submissionQueue);
      this.tryQueue();
    }

    async tryQueue() {
      if(!this.activeRecord) {
        if(this.submissionQueue.length > 0){
          const record = this.submissionQueue.shift();
          this.sync(record);
        } else {
          this.updateStatus('idle');
        }
      }
    }

    async getContacts() {
      return this.contacts;
    }

    async sync(record) {
      this.activeRecord = record;
      this.updateListenersOfActiveRecord(record.id);
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
        this.activeRecord = null;
        this.updateListenersOfActiveRecord(null);
        this.tryQueue();
      }, 1000);
    }

    async submit(name, email) {
      this.updateStatus(`submitting ${name}, ${email}`);
      const status = 'queued';
      try {
          const id =  await db.contacts.add({
              name,
              email,
              status,
          });
          this.submissionQueue.unshift({id, name, email, status});
          this.tryQueue();
        } catch (error) {
          console.log("Failed to save ${name} ${email} in db for queueing")
      }
      
      await this.updateListenersWithContacts();
    }

    async clear() {
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

    async updateListenersOfActiveRecord(id) {
      for(let i=0; i<this.updateListeners.length; i++){
        this.updateListeners[i]['activeRecord'](id);
      }
    }

    updateStatus(status){
      this.status = status;
      for(let i=0; i<this.updateListeners.length; i++){
        this.updateListeners[i]['status'](status);
      }
    }

    removeListener(listenerFunction) {
      //TODO
    }
}