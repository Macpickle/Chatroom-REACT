import React, { useState, useEffect } from 'react';
import "../stylesheet/style.css";
import Sidenav from '../components/sidenav.js';
import Navbar from '../components/navbar.js';
import MessageBox from '../components/messagebox.js';
import { socket } from '../utils/socket.js'

function Home() {
  const [messageID, setMessageID] = useState('');

  function setMessageIdHandler(id) {
    setMessageID(id);
  }

  return (
    <div>
      <Navbar />
      <Sidenav setMessageIdHandler={setMessageIdHandler}/>
      <MessageBox messageID={messageID} socketConnection={socket}/>
    </div>
  );
}
  
export default Home;