'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const NotificationSystem = React.memo(({ notifications, onRemove }: NotificationSystemProps) => {
  return (
    <div className="fixed top-4 right-4 z-[10001] flex flex-col gap-2 pointer-events-none">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
});

NotificationSystem.displayName = 'NotificationSystem';

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NotificationItem = ({ notification, onRemove }: NotificationItemProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const duration = notification.duration || 5000;
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onRemove(notification.id), 300);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onRemove]);

  const icons = {
    info: <Info className="text-blue-500" size={20} />,
    success: <CheckCircle className="text-green-500" size={20} />,
    warning: <AlertTriangle className="text-yellow-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />
  };

  const bgColors = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200'
  };

  const type = notification.type || 'info';

  return (
    <div
      className={`
        bg-white/95 backdrop-blur-xl border rounded-lg shadow-xl p-4 min-w-[320px] max-w-[400px]
        pointer-events-auto transition-all duration-300
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
        ${bgColors[type]}
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">{notification.title}</h4>
          {notification.message && (
            <p className="text-xs text-gray-600">{notification.message}</p>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onRemove(notification.id), 300);
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

