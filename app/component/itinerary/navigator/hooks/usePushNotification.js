import { useState, useEffect } from 'react';

const usePushNotification = config => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (notification) {
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, [notification]);

  const createNotification = (title, content) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const newNotification = new Notification(title, {
        body: content,
      });
      setNotification(newNotification);
    }
  };
  const notificationConsent = () => {
    if (config.experimental.notifications && 'Notification' in window) {
      if (
        Notification.permission !== 'denied' &&
        Notification.permission !== 'granted'
      ) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            createNotification(
              'Notifications Approved',
              'Notifications are now approved',
            );
          }
        });
      }
    }
  };

  return { createNotification, notificationConsent };
};
export { usePushNotification };
