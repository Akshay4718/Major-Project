import { useEffect, useState } from "react";

const CustomToast = ({ show, onClose, message, delay = 3000, position = 'bottom-end', type = 'info' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // Trigger animation
      setTimeout(() => setIsVisible(true), 10);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300); // Wait for exit animation
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, delay, onClose]);

  if (!show) return null;

  // Auto-detect type from message content
  const detectType = () => {
    if (type !== 'info') return type; // Use explicit type if provided
    
    const lowerMessage = message?.toLowerCase() || '';
    if (lowerMessage.includes('success') || lowerMessage.includes('successfully') || lowerMessage.includes('created') || lowerMessage.includes('updated') || lowerMessage.includes('added')) {
      return 'success';
    }
    if (lowerMessage.includes('error') || lowerMessage.includes('failed') || lowerMessage.includes('invalid') || lowerMessage.includes('not found')) {
      return 'error';
    }
    if (lowerMessage.includes('warning') || lowerMessage.includes('please') || lowerMessage.includes('required')) {
      return 'warning';
    }
    return 'info';
  };

  const toastType = detectType();
  
  // Get style based on detected type
  const getStyleForType = () => {
    switch (toastType) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          icon: 'fa-circle-check',
          iconBg: 'bg-green-600',
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-rose-500',
          icon: 'fa-circle-xmark',
          iconBg: 'bg-red-600',
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          icon: 'fa-triangle-exclamation',
          iconBg: 'bg-yellow-600',
        };
      default: // info
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
          icon: 'fa-circle-info',
          iconBg: 'bg-blue-600',
        };
    }
  };
  
  const style = getStyleForType();

  // Position classes
  const positionClasses = {
    'top-start': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-end': 'top-4 right-4',
    'bottom-start': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-end': 'bottom-4 right-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position] || positionClasses['bottom-end']} z-[9999] transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      style={{ maxWidth: '400px', minWidth: '300px' }}
    >
      <div className={`${style.bg} text-white rounded-xl shadow-2xl overflow-hidden`}>
        <div className="flex items-center p-4 gap-3">
          {/* Icon */}
          <div className={`${style.iconBg} p-2 rounded-full flex-shrink-0`}>
            <i className={`fa-solid ${style.icon} text-xl`}></i>
          </div>
          
          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-relaxed break-words">{message}</p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(), 300);
            }}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-white/20 relative overflow-hidden">
          <div
            className="h-full bg-white/60 absolute left-0 top-0"
            style={{
              animation: `shrink ${delay}ms linear forwards`,
            }}
          />
        </div>
      </div>
      
      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomToast;

