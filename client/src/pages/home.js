import React, { useState } from 'react';
import "../stylesheet/style.css";
import Sidenav from '../components/sidenav.js';
import Navbar from '../components/navbar.js';
import MessageBox from '../components/messagebox.js';
import { socket } from '../utils/socket.js'

function Home() {
  // for transfering data between multiple elements
  const [messageID, setMessageID] = useState('');
  const [displaySidebar, setSidebar] = useState(true);

  // sets message id based on sidenav selection
  function setMessageIdHandler(id) {
    setMessageID(id);
  }

  // for mobile support, shows the selection based on input + screen size
  function showSidebar(value) {
    setSidebar(value);
    
    if (window.innerWidth < 768) {
      if (displaySidebar) {
        document.getElementById('sidenav').style.display = 'flex';
        document.getElementById('message').style.display = 'none';
      }

      else {
        document.getElementById('sidenav').style.display = 'none';
        document.getElementById('message').style.display = 'flex';
      }
    } else {
      document.getElementById('sidenav').style.display = 'flex';
      document.getElementById('message').style.display = 'flex';
    }
  }

  return (
    <div>
      <Navbar />
      <Sidenav setMessageIdHandler={setMessageIdHandler} showSidebar={showSidebar}/>
      <MessageBox messageID={messageID} socketConnection={socket} showSidebar={showSidebar}/>
    </div>
  );
}
  
export default Home;