import React, { useState, useEffect, useRef } from 'react';
import ContactsModel from './ContactsModel';

function ContactList() {
  const model = new ContactsModel();
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [activeRecordId, setActiveRecordId] = useState('');
  const [online, setOnline] = useState('ready to submit contacts');
  const [status, setStatus] = useState('status placeholder');
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  const handleSubmit = async (e) => {
    console.log(e);
    e.preventDefault();
    if(!name){
      setError('please provide a name');
      nameRef.current.focus();
      return;
    }
    if(!email){
      setError('please provide an email address');
      emailRef.current.focus();
      return;
    }

    setName('');
    setEmail('');
    setError('');

    nameRef.current.focus();

    await model.submit(name, email);
  };

  const clearContacts = async (e) => {
    console.log(e);
    e.preventDefault();

    await model.clear();
  };

  const submitRandom = async (e) => {
    console.log(e);
    e.preventDefault();

    let fakeNames = ['alice', 'bob', 'chad', 'dorothy', 'elvis', 'jerry', 'nathan', 'walter', 'shelly', 'mary'];
    for(let i=0; i<5; i++){
      let index = Math.floor(Math.random() * fakeNames.length);
      let name = fakeNames[index];
      let email = name + '@' + name + '.com';
      await model.submit(name, email);
    }
  };

  const retrySync = async (e) => {
    console.log(e);
    e.preventDefault();

    await model.retrySync();
  };

  useEffect(() => {
    async function fetchData() {
      console.log('HERE');
      await model.init();
      setContacts(await model.getContacts());
      setOnline(model.isOnline);
    }
    fetchData();

    let modelListener = { 
      contacts: (contacts) => {
        setContacts(contacts);
      },
      online: (online) => {
        setOnline(online);
      },
      status: (status) => {
        setStatus(status);
      },
      activeRecord: (id) => {
        setActiveRecordId(id);
      }
    }
    model.addListener(modelListener);

    return () => {
      model.removeListener(modelListener);
    }

  });

  const getContactStyle = (contact) => {
    if (contact.id === activeRecordId) {
      return {backgroundColor:'orange'};
    }

    switch(contact.status){
      case 'failed':
        return {backgroundColor:'red'};
      case 'queued':
        return online ? {backgroundColor:'green'} : {backgroundColor: 'lightblue'};
      case 'synced':
      default:
        return {backgroundColor:'blue'};
    }
  }

  const getInfoStyle = () => {
    if (error) {
      return {backgroundColor: 'red', width: "508px", justifyContent: "center"};
    }

    if(online){
      return {backgroundColor: 'green', width: "508px", justifyContent: "center"};
    }
    
    return {backgroundColor: 'lightblue', width: "508px", justifyContent: "center"};
  }

  const getInfoText = () => {
    if(error){
      return error;
    }

    return online ? 'online: ready to submit' : 'offline: submissions will be queued';
  }

  return (
    <div style={{dispay: "flex", textAlign: "center", justifyContent: "center"}}>
      <div style={{display: "flex", justifyContent: "center"}}>
        <div style={getInfoStyle()}>
         {getInfoText()}
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          style = {{width: "195px"}}
          ref = {nameRef}
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style = {{width: "195px"}}
          ref = {emailRef}
        />
        <button type="submit" style = {{width: "103px"}}>Add Contact</button>
      </form>
      
      <div className="status" style={{display: "flex", justifyContent: "center"}}>
        <div style={{backgroundColor: 'orange', width: "508px", display: "flex", justifyContent: "center"}}>
        {status}
        </div>
      </div>

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
          <tr style= {getContactStyle(contact)} key={contact.id}>
            <td>{contact.name}</td>
            <td>{contact.email}</td>
            <td>{contact.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    <div>
      <button type="submit" style = {{width: "508px"}} onClick = {retrySync}>retry sync</button>
    </div>
    <div>
      <button type="submit" style = {{width: "508px"}} onClick = {submitRandom}>submit five random</button>
    </div>
    <div>  
      <button type="submit" style = {{width: "508px"}} onClick = {clearContacts}>clear contacts</button>
    </div>  
    </div>
  );
}

export default ContactList;