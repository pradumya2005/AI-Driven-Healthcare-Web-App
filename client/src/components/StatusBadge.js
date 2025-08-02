import React from 'react';

const StatusBadge = ({ statusCode, statusMessage, className = '' }) => {
  const getStatusClass = (code) => {
    switch (code) {
      case 1: // AVAILABLE
        return 'status-available';
      case 2: // BUSY
        return 'status-busy';
      case 3: // IN_MEETING
        return 'status-in-meeting';
      case 4: // OFFICE_HOURS
        return 'status-office-hours';
      case 5: // AWAY
        return 'status-away';
      case 6: // ONLINE_ONLY
        return 'status-online-only';
      case 0: // UNAVAILABLE
      default:
        return 'status-unavailable';
    }
  };

  const getStatusIcon = (code) => {
    switch (code) {
      case 1: // AVAILABLE
        return '✅';
      case 2: // BUSY
        return '🔴';
      case 3: // IN_MEETING
        return '📅';
      case 4: // OFFICE_HOURS
        return '🏢';
      case 5: // AWAY
        return '🚶';
      case 6: // ONLINE_ONLY
        return '💻';
      case 0: // UNAVAILABLE
      default:
        return '⭕';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(statusCode)} ${className}`}>
      <span className="mr-1">{getStatusIcon(statusCode)}</span>
      {statusMessage}
    </span>
  );
};

export default StatusBadge;