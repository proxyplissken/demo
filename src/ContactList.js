import React, { useState, useEffect, useRef } from 'react';
import db from './db';
import ContactsModel from './ContactsModel';

function ContactList() {
  const model = new ContactsModel();
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [activeRecordId, setActiveRecordId] = useState('');
  const [feedback, setFeedback] = useState('ready to submit contacts');
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
      await model.init();
      setContacts(await model.getContacts());
    }
    fetchData();

    let modelListener = { 
      contacts: (contacts) => {
        setContacts(contacts);
      },
      feedback: (feedback) => {
        setFeedback(feedback);
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

  }, []);

  const getStyle = (contact) => {
    if (contact.id === activeRecordId) {
      return {backgroundColor:'orange'};
    }

    switch(contact.status){
      case 'failed':
        return {backgroundColor:'red'};
      case 'queued':
        return {backgroundColor:'green'};
      case 'synced':
      default:
        return {backgroundColor:'blue'};

    }
  }

  return (
    <div style={{dispay: "flex", textAlign: "center", justifyContent: "center"}}>
      {error ? (<div className="error" style={{display: "flex", justifyContent: "center"}}>
        <div style={{backgroundColor: 'red', width: "508px", display: "flex", justifyContent: "center"}}>
         {error}
        </div>
      </div>) : (
        <div className="error" style={{display: "flex", justifyContent: "center"}}>
        <div style={{backgroundColor: 'green', width: "508px", display: "flex", justifyContent: "center"}}>
         {feedback}
        </div>
      </div>
      )

      }
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
          <tr style= {getStyle(contact)} key={contact.id}>
            <td>{contact.name}</td>
            <td>{contact.email}</td>
            <td>{contact.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    <button type="submit" style = {{width: "508px"}} onClick = {retrySync}>retry sync</button>
    <button type="submit" style = {{width: "508px"}} onClick = {submitRandom}>submit five random</button>
    <button type="submit" style = {{width: "508px"}} onClick = {clearContacts}>clear contacts</button>
    </div>
  );
}

export default ContactList;