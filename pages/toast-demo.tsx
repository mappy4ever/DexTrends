import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/design-system/Button';
import { GlassContainer } from '../components/ui/design-system/GlassContainer';

const ToastDemo = () => {
  const { toasts, removeToast, success, error, info, warning, promise } = useToast();

  const handleAsyncOperation = () => {
    const fakeAsyncOperation = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve({ data: 'Operation successful!' });
        } else {
          reject(new Error('Operation failed!'));
        }
      }, 2000);
    });

    promise(
      fakeAsyncOperation,
      {
        loading: 'Processing your request...',
        success: (data) => 'Successfully completed!',
        error: (err) => `Error: ${err.message}`
      },
      { position: 'top-center' }
    );
  };

  return (
    <>
      <Head>
        <title>Toast Notification Demo - DexTrends</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Toast Notification System
          </motion.h1>

          <GlassContainer variant="dark" blur="lg" className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Toast Types</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Button
                variant="primary"
                onClick={() => success('This is a success message!', { position: 'top-right' })}
                fullWidth
              >
                Show Success Toast
              </Button>
              
              <Button
                variant="primary"
                onClick={() => error('This is an error message!', { position: 'top-left' })}
                fullWidth
              >
                Show Error Toast
              </Button>
              
              <Button
                variant="primary"
                onClick={() => info('This is an info message!', { position: 'bottom-right' })}
                fullWidth
              >
                Show Info Toast
              </Button>
              
              <Button
                variant="primary"
                onClick={() => warning('This is a warning message!', { position: 'bottom-left' })}
                fullWidth
              >
                Show Warning Toast
              </Button>
            </div>

            <h2 className="text-2xl font-semibold mb-6">Toast Positions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Button
                variant="secondary"
                onClick={() => info('Top Center', { position: 'top-center', duration: 3000 })}
                fullWidth
              >
                Top Center
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => info('Bottom Center', { position: 'bottom-center', duration: 3000 })}
                fullWidth
              >
                Bottom Center
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => {
                  success('Top Right', { position: 'top-right', duration: 2000 });
                  setTimeout(() => {
                    info('Top Left', { position: 'top-left', duration: 2000 });
                  }, 500);
                  setTimeout(() => {
                    warning('Bottom Right', { position: 'bottom-right', duration: 2000 });
                  }, 1000);
                  setTimeout(() => {
                    error('Bottom Left', { position: 'bottom-left', duration: 2000 });
                  }, 1500);
                }}
                fullWidth
              >
                All Corners
              </Button>
            </div>

            <h2 className="text-2xl font-semibold mb-6">Advanced Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="tertiary"
                onClick={handleAsyncOperation}
                fullWidth
              >
                Async Operation (50/50 Success)
              </Button>
              
              <Button
                variant="tertiary"
                onClick={() => {
                  const longMessage = 'This is a really long message that demonstrates how the toast handles longer content. It should wrap nicely and maintain readability.';
                  info(longMessage, { duration: 6000 });
                }}
                fullWidth
              >
                Long Message Toast
              </Button>
              
              <Button
                variant="tertiary"
                onClick={() => {
                  info('This toast has no progress bar', { showProgress: false, duration: 5000 });
                }}
                fullWidth
              >
                No Progress Bar
              </Button>
              
              <Button
                variant="tertiary"
                onClick={() => {
                  info('This toast stays until dismissed', { duration: 0 });
                }}
                fullWidth
              >
                Persistent Toast
              </Button>
            </div>

            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Spring physics animations for smooth entry/exit</li>
                <li>Swipe to dismiss on desktop and mobile</li>
                <li>Auto-dismiss with visual progress indicator</li>
                <li>Multiple position options</li>
                <li>Support for async operations with promise API</li>
                <li>Stacking behavior for multiple toasts</li>
                <li>Fully typed with TypeScript</li>
              </ul>
            </div>
          </GlassContainer>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

export default ToastDemo;