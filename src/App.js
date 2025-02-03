import './App.css';
import ContactList from './ContactList';
import ContactsModel from './ContactsModel';

const model = new ContactsModel();

function App() {
  return (
    <div className="App">
      <header className="App-header">
        Takehome Demo
      </header>
      <ContactList model = {model}/>
    </div>
  );
}

export default App;
