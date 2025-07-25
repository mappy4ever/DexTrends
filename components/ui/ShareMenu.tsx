import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLink, FaImage, FaClipboard, FaQrcode } from 'react-icons/fa';
import { cn } from '../../utils/cn';

interface ShareMenuProps {
  onShare: (method: 'link' | 'image' | 'stats' | 'qr') => void;
  trigger: React.ReactElement;
  className?: string;
}

const ShareMenu: React.FC<ShareMenuProps> = ({ onShare, trigger, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const menuItems = [
    { id: 'link', label: 'Copy Link', icon: FaLink },
    { id: 'image', label: 'Share as Image', icon: FaImage },
    { id: 'stats', label: 'Copy Stats', icon: FaClipboard },
    { id: 'qr', label: 'QR Code', icon: FaQrcode },
  ];
  
  return (
    <div className={cn("relative", className)} ref={menuRef}>
      {/* Trigger button */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-56 origin-top-right z-50"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
          >
            <div className="rounded-xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="p-1">
                {menuItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onShare(item.id as any);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg",
                      "text-gray-700 dark:text-gray-300",
                      "hover:bg-gray-100 dark:hover:bg-gray-700",
                      "transition-colors duration-150",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    )}
                  >
                    <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              
              {/* Footer note */}
              <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                Share this Pokémon with others
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareMenu;