import React from 'react';

const Notification = ({ notification }) => {
  if (!notification.show) return null;

  const bgColor = {
    success: 'bg-green-500 dark:bg-green-600',
    error: 'bg-red-500 dark:bg-red-600',
    warning: 'bg-yellow-500 dark:bg-yellow-600'
  }[notification.type];

  const textColor = 'text-white';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} ${textColor} px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm animate-fade-in`}>
      <div className="flex items-center space-x-2">
        {notification.type === 'success' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {notification.type === 'error' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {notification.type === 'warning' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )}
        <p className="font-medium">{notification.message}</p>
      </div>
    </div>
  );
};

export default Notification;