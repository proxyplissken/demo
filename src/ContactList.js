import React, { useState } from 'react';
import ContactsModel from './ContactsModel';

let fakeContacts = [
  {
    name: "John",
    email: "john@hotmail.com",
    status: 'syncing',
    synced: true,
  },
  {
    name: "Mary",
    email: "mary@hotmail.com",
    status: 'syncing',
    synced: true,
  },
];

function ContactList() {
  const [contacts, setContacts] = useState(fakeContacts);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {

    console.log(e);
    e.preventDefault(); //prevents default behavior
    fakeContacts = fakeContacts.concat({name, email, status: 'queued'});
    setName('');
    setEmail('');
    setContacts(fakeContacts);
  };

  let model = new ContactsModel();

  return (
    <div style={{textAlign: "center"}}>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          style = {{width: "195px"}}
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style = {{width: "195px"}}
        />
        <button type="submit" style = {{width: "103px"}}>Add Contact</button>
      </form>

      <h2>Contacts:</h2>

      <div className="table-container" style={{display: "flex", justifyContent: "center"}}>
      <table style={{backgroundColor: 'blue', width: "500px", tableLayout: "fixed"}}>
      <thead>
        <tr>
          <th style={{width: "200px"}}>Name</th>
          <th style={{width: "200px"}}>Email</th>
          <th style={{width: "100px"}}>Status</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map((contact) => (
          <tr key={contact.email}>
            <td>{contact.name}</td>
            <td>{contact.email}</td>
            <td>{contact.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    </div>
  );
}

export default ContactList;