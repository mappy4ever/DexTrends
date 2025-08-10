import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCode, FaEye, FaClipboard, FaCheck, FaPlus, FaHeart, 
  FaShare, FaTrash, FaCopy, FaEdit, FaDownload, FaUpload,
  FaChevronRight, FaSearch, FaMoon, FaSun
} from 'react-icons/fa';

// UI Components
import { GlassContainer } from '../components/ui/design-system/GlassContainer';
import { Button } from '../components/ui/design-system/Button';
import { CircularCard } from '../components/ui/design-system/CircularCard';
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
import { convertNotificationsToToasts } from '../utils/toastUtils';
import { ContextMenu, useContextMenu } from '../components/ui/ContextMenu';
import Modal from '../components/ui/modals/Modal';
import { 
  StaggerList as StaggerContainer, 
  AnimatedSkeleton as AnimatedCard, 
  EnhancedPageTransition as PageTransition 
} from '../components/ui/EnhancedAnimationSystem';

// Mobile Components
import { 
  SwipeToRefresh, 
  PinchToZoom, 
  LongPressMenu 
} from '../components/mobile';

// Hooks
import { useNotifications } from '../hooks/useNotifications';
import { useContextualTheme } from '../hooks/useContextualTheme';

interface SectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  id: string;
}

const Section: React.FC<SectionProps> = ({ title, description, children, id }) => {
  const [showCode, setShowCode] = useState(false);
  
  return (
    <section id={id} className="mb-16 scroll-mt-20">
      <GlassContainer variant="light" blur="sm" className="p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        
        <div className="space-y-6">
          {children}
        </div>
      </GlassContainer>
    </section>
  );
};

const CodeExample: React.FC<{ code: string; language?: string }> = ({ code, language = 'tsx' }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      setCopied(false);
      timerRef.current = null;
    }, 2000);
  };
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  return (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
      >
        {copied ? <FaCheck className="text-green-400" /> : <FaClipboard />}
      </button>
    </div>
  );
};

const UIShowcase = () => {
  // State management
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');
  const [progress, setProgress] = useState(30);
  const [currentStep, setCurrentStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Hooks
  const { toasts, removeToast, success, error, info, warning, promise } = useNotifications();
  const { isOpen, position, items, openMenu, closeMenu } = useContextMenu();
  const theme = useContextualTheme('ui');
  
  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      if (asyncOperationTimerRef.current) {
        clearTimeout(asyncOperationTimerRef.current);
      }
    };
  }, []);
  
  // Sample data
  const steps = [
    { id: 'basic', label: 'Basic Info', description: 'Enter your details' },
    { id: 'prefs', label: 'Preferences', description: 'Set your preferences' },
    { id: 'review', label: 'Review', description: 'Review and confirm' },
    { id: 'complete', label: 'Complete', description: 'All done!' }
  ];
  
  const contextMenuItems = [
    { id: 'copy', icon: <FaCopy />, label: 'Copy', action: () => info('Copied!') },
    { id: 'edit', icon: <FaEdit />, label: 'Edit', action: () => info('Edit mode') },
    { id: 'share', icon: <FaShare />, label: 'Share', action: () => success('Shared!') },
    { id: 'delete', icon: <FaTrash />, label: 'Delete', action: () => error('Deleted!'), color: 'text-red-500' }
  ];
  
  const navigation = [
    { label: 'Form Components', href: '#forms' },
    { label: 'Progress Indicators', href: '#progress' },
    { label: 'Feedback', href: '#feedback' },
    { label: 'Design System', href: '#design' },
    { label: 'Animations', href: '#animations' },
    { label: 'Mobile', href: '#mobile' }
  ];
  
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    await new Promise(resolve => {
      refreshTimerRef.current = setTimeout(() => {
        resolve(undefined);
        refreshTimerRef.current = null;
      }, 2000);
    });
    
    success('Content refreshed!');
    setIsRefreshing(false);
  };
  
  const asyncOperationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleAsyncOperation = () => {
    const fakeAsyncOperation = new Promise((resolve, reject) => {
      asyncOperationTimerRef.current = setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve({ data: 'Operation successful!' });
        } else {
          reject(new Error('Operation failed!'));
        }
        asyncOperationTimerRef.current = null;
      }, 2000);
    });

    promise(
      fakeAsyncOperation,
      {
        loading: 'Processing...',
        success: 'Successfully completed!',
        error: (err) => `Error: ${err.message}`
      }
    );
  };
  
  return (
    <>
      <Head>
        <title>UI Components Showcase - DexTrends</title>
        <meta name="description" content="Interactive showcase of DexTrends UI components" />
      </Head>
      
      <PageTransition>
        <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                  <motion.h1 
                    className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    DexTrends UI Components
                  </motion.h1>
                  
                  <div className="flex items-center gap-4">
                    <nav className="hidden md:flex gap-6">
                      {navigation.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          className="text-gray-600 hover:text-purple-600 transition-colors"
                        >
                          {item.label}
                        </a>
                      ))}
                    </nav>
                    
                    <EnhancedSwitch
                      checked={darkMode}
                      onChange={setDarkMode}
                      label={darkMode ? 'Dark' : 'Light'}
                    />
                  </div>
                </div>
              </div>
            </header>
            
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* Hero Section */}
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-5xl font-bold mb-4">
                  Beautiful, Modern UI Components
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                  Built with React, TypeScript, and Framer Motion
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="primary" 
                    size="lg"
                    leftIcon={<FaCode />}
                    onClick={() => window.open('/docs/UI_COMPONENTS_GUIDE.md', '_blank')}
                  >
                    View Documentation
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={handleAsyncOperation}
                  >
                    Try Async Toast
                  </Button>
                </div>
              </motion.div>
              
              {/* Form Components */}
              <Section 
                id="forms" 
                title="Form Components" 
                description="Interactive form inputs with validation and animations"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <EnhancedInput
                      label="Enhanced Input"
                      placeholder="Type something..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      helperText="This is a helper text"
                      icon={<FaSearch />}
                    />
                    
                    <CodeExample code={`<EnhancedInput
  label="Enhanced Input"
  placeholder="Type something..."
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
  helperText="This is a helper text"
  icon={<FaSearch />}
/>`} />
                  </div>
                  
                  <div>
                    <EnhancedSelect
                      label="Enhanced Select"
                      value={selectValue}
                      onChange={(value) => setSelectValue(value)}
                      placeholder="Choose an option"
                      options={[
                        { value: '', label: 'Select...' },
                        { value: 'fire', label: 'Fire Type' },
                        { value: 'water', label: 'Water Type' },
                        { value: 'grass', label: 'Grass Type' }
                      ]}
                    />
                  </div>
                  
                  <div>
                    <EnhancedSwitch
                      label="Enhanced Switch"
                      checked={switchValue}
                      onChange={setSwitchValue}
                    />
                  </div>
                  
                  <div>
                    <EnhancedTextarea
                      label="Enhanced Textarea"
                      placeholder="Write your message..."
                      value={textareaValue}
                      onChange={(e) => setTextareaValue(e.target.value)}
                      maxLength={200}
                      rows={3}
                    />
                  </div>
                </div>
              </Section>
              
              {/* Progress Indicators */}
              <Section 
                id="progress" 
                title="Progress Indicators" 
                description="Various progress visualization components"
              >
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Circular Progress</h3>
                    <div className="flex gap-8 items-center flex-wrap">
                      <CircularProgress value={progress} size={80} />
                      <CircularProgress value={65} size={60} strokeWidth={8} showValue />
                      <CircularProgress value={0} indeterminate size={60} />
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => setProgress(Math.max(0, progress - 10))}
                        >
                          -10%
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => setProgress(Math.min(100, progress + 10))}
                        >
                          +10%
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Linear Progress</h3>
                    <div className="space-y-4">
                      <LinearProgress value={progress} showValue />
                      <LinearProgress value={75} variant="striped" showValue />
                      <LinearProgress value={50} variant="gradient" showValue />
                      <LinearProgress value={0} indeterminate />
                      <LinearProgress value={75} segments={3} />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Step Progress</h3>
                    <StepProgress steps={steps} currentStep={currentStep} />
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                      >
                        Previous
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                        disabled={currentStep === steps.length - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </Section>
              
              {/* Feedback Components */}
              <Section 
                id="feedback" 
                title="Feedback Components" 
                description="Toast notifications and context menus"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Toast Notifications</h3>
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
                      <Button 
                        onClick={() => warning('Warning notification!')}
                        fullWidth
                      >
                        Show Warning Toast
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Context Menu</h3>
                    <div 
                      className="p-8 bg-white/50 dark:bg-gray-800/50 rounded-lg text-center cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 transition-colors"
                      onContextMenu={(e) => {
                        e.preventDefault();
                        openMenu(e, contextMenuItems);
                      }}
                    >
                      Right-click here for context menu
                    </div>
                  </div>
                </div>
              </Section>
              
              {/* Design System */}
              <Section 
                id="design" 
                title="Design System" 
                description="Core design components and patterns"
              >
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Buttons</h3>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="tertiary">Tertiary</Button>
                      <Button variant="primary" size="sm">Small</Button>
                      <Button variant="primary" size="lg">Large</Button>
                      <Button variant="primary" isLoading>Loading</Button>
                      <Button variant="primary" leftIcon={<FaPlus />}>With Icon</Button>
                      <Button variant="primary" disabled>Disabled</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Glass Containers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <GlassContainer variant="light" blur="sm">
                        <h4 className="font-semibold mb-2">Light Glass</h4>
                        <p className="text-sm text-gray-600">Subtle glass effect</p>
                      </GlassContainer>
                      
                      <GlassContainer variant="medium" blur="md">
                        <h4 className="font-semibold mb-2">Medium Glass</h4>
                        <p className="text-sm text-gray-600">Balanced opacity</p>
                      </GlassContainer>
                      
                      <GlassContainer variant="dark" blur="lg">
                        <h4 className="font-semibold mb-2 text-white">Dark Glass</h4>
                        <p className="text-sm text-gray-300">Strong presence</p>
                      </GlassContainer>
                      
                      <GlassContainer variant="colored" blur="xl">
                        <h4 className="font-semibold mb-2">Colored Glass</h4>
                        <p className="text-sm text-gray-600">With gradient</p>
                      </GlassContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Circular Cards</h3>
                    <div className="flex flex-wrap gap-6">
                      <CircularCard
                        size="sm"
                        title="Small"
                        subtitle="60px"
                        onClick={() => info('Small card clicked')}
                      />
                      <CircularCard
                        size="md"
                        title="Medium"
                        subtitle="80px"
                        badge="New"
                        onClick={() => info('Medium card clicked')}
                      />
                      <CircularCard
                        size="lg"
                        title="Large"
                        subtitle="120px"
                        image="/api/placeholder/120/120"
                        onClick={() => info('Large card clicked')}
                      />
                    </div>
                  </div>
                </div>
              </Section>
              
              {/* Animations */}
              <Section 
                id="animations" 
                title="Animations" 
                description="Smooth animations and transitions"
              >
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Stagger Animation</h3>
                    <StaggerContainer className="grid grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <AnimatedCard 
                          key={item} 
                          height="100px" 
                          className="bg-purple-100 dark:bg-purple-900/20"
                        />
                      ))}
                    </StaggerContainer>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Modal</h3>
                    <Button onClick={() => setShowModal(true)}>
                      Open Modal
                    </Button>
                    <Modal
                      isOpen={showModal}
                      onClose={() => setShowModal(false)}
                      title="Example Modal"
                    >
                      <div className="p-6">
                        <p className="mb-4">This is a modal with smooth animations and backdrop blur.</p>
                        <div className="flex gap-2 justify-end">
                          <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                          </Button>
                          <Button variant="primary" onClick={() => {
                            setShowModal(false);
                            success('Confirmed!');
                          }}>
                            Confirm
                          </Button>
                        </div>
                      </div>
                    </Modal>
                  </div>
                </div>
              </Section>
              
              {/* Mobile Components */}
              <Section 
                id="mobile" 
                title="Mobile Components" 
                description="Touch-optimized components for mobile devices"
              >
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Swipe to Refresh</h3>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-64 overflow-auto">
                      <SwipeToRefresh onRefresh={handleRefresh} disabled={isRefreshing}>
                        <div className="space-y-4">
                          <p>Pull down to refresh this content</p>
                          {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="p-4 bg-white dark:bg-gray-700 rounded-lg">
                              Content item {item}
                            </div>
                          ))}
                        </div>
                      </SwipeToRefresh>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Pinch to Zoom</h3>
                    <PinchToZoom>
                      <img 
                        src="/api/placeholder/400/300" 
                        alt="Pinch to zoom demo"
                        className="rounded-lg w-full"
                      />
                    </PinchToZoom>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Long Press Menu</h3>
                    <LongPressMenu
                      items={contextMenuItems}
                    >
                      <div className="p-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-center">
                        Long press (mobile) or right-click (desktop) here
                      </div>
                    </LongPressMenu>
                  </div>
                </div>
              </Section>
            </main>
            
            {/* Footer */}
            <footer className="mt-24 py-8 border-t border-gray-200 dark:border-gray-700">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
                <p>DexTrends UI Components • Built with ❤️ using React & TypeScript</p>
              </div>
            </footer>
          </div>
        </div>
      </PageTransition>
      
      {/* Toast Container */}
      <ToastContainer toasts={convertNotificationsToToasts(toasts)} onClose={removeToast} />
      
      {/* Context Menu */}
      {isOpen && (
        <ContextMenu
          items={items}
          position={position}
          onClose={closeMenu}
        />
      )}
    </>
  );
};

export default UIShowcase;