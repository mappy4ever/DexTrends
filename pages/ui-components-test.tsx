import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from '../components/ui/LazyMotion';
import { GlassContainer } from '../components/ui/design-system/GlassContainer';
import { Button } from '../components/ui/design-system/Button';
import { 
  EnhancedInput, 
  EnhancedSelect, 
  EnhancedSwitch, 
  EnhancedTextarea 
} from '../components/ui/forms';
import { 
  CircularProgress, 
  LinearProgress, 
  StepProgress 
} from '../components/ui/progress';
import { ToastContainer } from '../components/ui/Toast';
import { useNotifications } from '../hooks/useNotifications';
import { convertNotificationsToToasts } from '../utils/toastUtils';
import { ContextMenu, useContextMenu } from '../components/ui/ContextMenu';
import { FaCopy, FaEdit, FaTrash, FaShare } from '../components/ui/LazyIcon';

const UIComponentsTest = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');
  const [progress, setProgress] = useState(30);
  const [currentStep, setCurrentStep] = useState(1);
  
  const { toasts, removeToast, success, error, info } = useNotifications();
  const { isOpen, position, items, openMenu, closeMenu } = useContextMenu();

  const steps = [
    { id: 'details', label: 'Details', description: 'Enter basic information' },
    { id: 'preferences', label: 'Preferences', description: 'Set your preferences' },
    { id: 'review', label: 'Review', description: 'Review and confirm' },
    { id: 'complete', label: 'Complete', description: 'All done!' }
  ];

  const contextMenuItems = [
    { id: 'copy', icon: <FaCopy />, label: 'Copy', action: () => info('Copied!') },
    { id: 'edit', icon: <FaEdit />, label: 'Edit', action: () => info('Edit mode') },
    { id: 'share', icon: <FaShare />, label: 'Share', action: () => success('Shared!') },
    { id: 'delete', icon: <FaTrash />, label: 'Delete', action: () => error('Deleted!'), color: 'text-red-500' }
  ];

  return (
    <>
      <Head>
        <title>UI Components Test - DexTrends</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.h1 
            className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            UI Components Test Suite
          </motion.h1>

          {/* Form Components */}
          <GlassContainer variant="medium" blur="md" className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Form Components</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <EnhancedInput
                  label="Enhanced Input"
                  placeholder="Type something..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  helperText="This is a helper text"
                />
              </div>

              <div>
                <EnhancedSelect
                  label="Enhanced Select"
                  value={selectValue}
                  onChange={(value) => setSelectValue(value)}
                  placeholder="Choose an option"
                  options={[
                    { value: "option1", label: "Option 1" },
                    { value: "option2", label: "Option 2" },
                    { value: "option3", label: "Option 3" }
                  ]}
                />
              </div>

              <div className="md:col-span-2">
                <EnhancedTextarea
                  label="Enhanced Textarea"
                  placeholder="Write your message..."
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <EnhancedSwitch
                  label="Enhanced Switch"
                  checked={switchValue}
                  onChange={(checked) => setSwitchValue(checked)}
                />
              </div>
            </div>
          </GlassContainer>

          {/* Progress Components */}
          <GlassContainer variant="dark" blur="lg" className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-white">Progress Indicators</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4 text-white">Circular Progress</h3>
                <div className="flex gap-8 items-center">
                  <CircularProgress value={progress} size={80} />
                  <CircularProgress value={65} size={60} strokeWidth={8} showValue />
                  <CircularProgress indeterminate value={0} size={60} />
                </div>
                <div className="mt-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => setProgress(Math.min(progress + 10, 100))}
                  >
                    Increase Progress
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 text-white">Linear Progress</h3>
                <div className="space-y-4">
                  <LinearProgress value={progress} showValue />
                  <LinearProgress value={75} variant="striped" showValue />
                  <LinearProgress value={50} variant="gradient" showValue />
                  <LinearProgress indeterminate value={0} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 text-white">Step Progress</h3>
                <StepProgress steps={steps} currentStep={currentStep} />
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
                    disabled={currentStep === steps.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </GlassContainer>

          {/* Toast & Context Menu */}
          <GlassContainer variant="light" blur="sm" className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Interactive Components</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Toast Notifications</h3>
                <div className="space-y-2">
                  <Button 
                    variant="primary" 
                    onClick={() => success('Success notification!')}
                    fullWidth
                  >
                    Show Success Toast
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => error('Error notification!')}
                    fullWidth
                  >
                    Show Error Toast
                  </Button>
                  <Button 
                    variant="tertiary" 
                    onClick={() => info('Info notification!')}
                    fullWidth
                  >
                    Show Info Toast
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Context Menu</h3>
                <div 
                  className="p-8 bg-white/50 rounded-lg text-center cursor-pointer border-2 border-dashed border-gray-300"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    openMenu(e, contextMenuItems);
                  }}
                >
                  Right-click here for context menu
                </div>
              </div>
            </div>
          </GlassContainer>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={convertNotificationsToToasts(toasts)} onClose={removeToast} />
      
      {/* Context Menu */}
      {isOpen && (
        <ContextMenu
          items={items}
          position={position}
          onClose={closeMenu}
          variant="list"
        />
      )}
    </>
  );
};

export default UIComponentsTest;