 const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div className={`notification ${type}`}>
      {message}
      <button onClick={onClose} className="notification-close">
        &times;
      </button>
    </div>
  );
};

export default Notification;