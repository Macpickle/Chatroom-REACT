import React, { useState } from 'react';
import "../stylesheet/style.css";
import Sidenav from '../components/sidenav.js';
import Navbar from '../components/navbar.js';
import MessageBox from '../components/messagebox.js';

function Home() {
  const [messageID, setMessageID] = useState('');

  function setMessageIdHandler(id) {
    setMessageID(id);
  }

  return (
    <div>
      <Navbar />
      <Sidenav setMessageIdHandler={setMessageIdHandler}/>
      <MessageBox messageID={messageID}/>
    </div>
  );
}
  
export default Home;