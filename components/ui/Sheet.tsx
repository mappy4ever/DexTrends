import React from 'react';
import { Modal, ModalProps } from './Modal';

export type SheetPosition = 'bottom' | 'top' | 'left' | 'right';
export type SheetSize = 'sm' | 'md' | 'lg' | 'full';

export interface SheetProps extends Omit<ModalProps, 'position' | 'mobileAsSheet'> {
  position?: SheetPosition;
}

/**
 * Sheet Component
 * A specialized modal that slides in from the edges of the screen
 * Perfect for mobile bottom sheets and side panels
 */
export const Sheet: React.FC<SheetProps> = ({
  position = 'bottom',
  animation,
  className,
  size = 'md',
  ...modalProps
}) => {
  // Map sheet position to modal position
  const modalPosition = position as ModalProps['position'];
  
  // Map sheet position to appropriate animation
  const getAnimation = (): ModalProps['animation'] => {
    if (animation) return animation;
    
    switch (position) {
      case 'bottom':
        return 'slide-up';
      case 'top':
        return 'slide-down';
      case 'left':
        return 'slide-right';
      case 'right':
        return 'slide-left';
      default:
        return 'slide-up';
    }
  };

  // Map sheet size to modal size based on position
  const getModalSize = (): ModalProps['size'] => {
    if (position === 'bottom' || position === 'top') {
      return 'full'; // Full width for top/bottom sheets
    }
    
    // Map sizes for left/right sheets
    switch (size) {
      case 'sm':
        return 'sm';
      case 'md':
        return 'md';
      case 'lg':
        return 'lg';
      case 'full':
        return '2xl';
      default:
        return 'md';
    }
  };

  // Add position-specific classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'rounded-t-2xl rounded-b-none';
      case 'top':
        return 'rounded-b-2xl rounded-t-none';
      case 'left':
        return 'rounded-r-2xl rounded-l-none h-full';
      case 'right':
        return 'rounded-l-2xl rounded-r-none h-full';
      default:
        return '';
    }
  };

  return (
    <Modal
      {...modalProps}
      position={modalPosition}
      animation={getAnimation()}
      size={getModalSize()}
      mobileAsSheet={false} // Sheets are always sheets
      className={`${getPositionClasses()} ${className || ''}`}
    />
  );
};

export default Sheet;