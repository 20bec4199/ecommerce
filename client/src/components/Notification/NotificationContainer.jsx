// components/Notification/NotificationContainer.js
import React from 'react';
import { useApp } from '../../context/AppContext';
import Notification from './Notification';

const NotificationContainer = () => {
  const { state, dispatch } = useApp();
  const { notifications } = state.ui;

  const handleClose = (id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;