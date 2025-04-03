import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'sm',
}) => {
  // Size classes mapping
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
  };

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 overflow-y-auto'
        >
          {/* Backdrop */}
          <div
            className='fixed inset-0  bg-opacity-50 transition-opacity'
            onClick={handleBackdropClick}
          >
            {/* Modal Container */}
            <div className='flex min-h-full items-center justify-center p-4'>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl`}
              >
                {/* Modal Header */}
                {title && (
                  <div className='flex items-center justify-between p-4 border-b border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      {title}
                    </h3>
                    <button
                      onClick={onClose}
                      className='text-gray-400 hover:text-gray-500 focus:outline-none cursor-pointer'
                    >
                      <svg
                        className='h-6 w-6'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Modal Content */}
                <div className={!title ? 'pt-4' : ''}>{children}</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
