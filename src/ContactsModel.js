import ContactsDao from "./ContactsDao";

export default class ContactsModel {
    constructor() {
      if (ContactsModel.instance) {
        return ContactsModel.instance;
      }
  
      this.contactsDao = new ContactsDao();
      ContactsModel.instance = this;
    }
}