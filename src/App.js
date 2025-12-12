import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AddModal from './components/common/AddModal';
import Sidebar from './components/common/Sidebar';
import AuthIndex from "./screens/AuthIndex";
import MainIndex from './screens/MainIndex';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import socket from './socket/socket';

function App(props) {
  const location = useLocation();
  const activekey = () => location.pathname;

  const [isConnected, setIsConnected] = useState(socket.connected);

  const authRoutes = [
    '/sign-in', '/sign-up', '/reset-password',
    '/verification/:id', '/page-404'
  ];

  useEffect(() => {
    const senderData = JSON.parse(localStorage.getItem("User-admin-data"));
    const senderId = senderData?._id;

    // Mixpanel tracking removed

    const onConnect = () => {
      setIsConnected(true);
      // console.log("Socket connected globally:", socket.id);
      
      if (senderId) {
        socket.emit("new user", senderId);
        // console.log(` Emitted 'new user' event for admin ID: ${senderId}`);
      } else {
        // console.log("Socket connected, but no admin is logged in.");
      }
    };

    
    const onDisconnect = () => {
      setIsConnected(false);
      console.log(" Socket disconnected globally.");
    };

    const handleNewTicket = (data) => {
      // console.log("Received 'new ticket' event globally:", data);
      
      
      const ticketId = data?.ticketId || 'a new';
      toast.info(`New Support Ticket Received`);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
     socket.on('new ticket', handleNewTicket);
    if (socket.connected) {
      onConnect();
    }
  
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new ticket', handleNewTicket);
    };
  }, [location]);

  // Handle click outside sidebar to close it on mobile and toggle overlay
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('mainsidemenu');
      const toggleButton = document.querySelector('.menu-toggle');
      const overlay = document.getElementById('sidebar-overlay');
      
      if (sidebar && sidebar.classList.contains('open')) {
        // Check if click is outside sidebar and not on toggle button
        if (
          !sidebar.contains(event.target) && 
          !toggleButton?.contains(event.target) &&
          !event.target.closest('.menu-toggle')
        ) {
          sidebar.classList.remove('open');
          if (overlay) {
            overlay.classList.remove('active');
          }
        }
      }
    };

    // Toggle overlay based on sidebar state
    const toggleOverlay = () => {
      const sidebar = document.getElementById('mainsidemenu');
      const overlay = document.getElementById('sidebar-overlay');
      
      if (sidebar && overlay) {
        if (sidebar.classList.contains('open')) {
          overlay.classList.add('active');
        } else {
          overlay.classList.remove('active');
        }
      }
    };

    // Watch for sidebar open/close
    const observer = new MutationObserver(toggleOverlay);
    const sidebar = document.getElementById('mainsidemenu');
    
    if (sidebar) {
      observer.observe(sidebar, {
        attributes: true,
        attributeFilter: ['class']
      });
      
      // Initial check
      toggleOverlay();
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      observer.disconnect();
    };
  }, []);

  // Mixpanel tracking removed 

 
  const toastContainer = (
    <ToastContainer/>
  );

  // Removed auth check, always show main app
  return (
    <div id="ebazar-layout" className='theme-blue'>
      {toastContainer}
      {/* Mobile Sidebar Overlay/Backdrop */}
      <div 
        id="sidebar-overlay" 
        className="sidebar-overlay"
        onClick={(e) => {
          const sidebar = document.getElementById('mainsidemenu');
          const overlay = document.getElementById('sidebar-overlay');
          if (sidebar) {
            sidebar.classList.remove('open');
          }
          if (overlay) {
            overlay.classList.remove('active');
          }
        }}
      ></div>
      <Sidebar activekey={activekey()} history={props.history} />
      <AddModal />
      <MainIndex activekey={activekey()} />
    </div>
  );
}

export default App;