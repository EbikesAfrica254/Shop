// src/components/ui/NotificationContainer.jsx
import React, { memo } from 'react';
import { useCart } from '../../contexts/CartContext';

const NotificationContainer = memo(() => {
  const { notifications } = useCart();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container" aria-live="polite">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification notification-${notification.type}`}
          role="alert"
        >
          <span>{notification.message}</span>
        </div>
      ))}
    </div>
  );
});

NotificationContainer.displayName = 'NotificationContainer';
export default NotificationContainer;