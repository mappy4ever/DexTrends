import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiX, FiFileText, FiFile, FiCode } from 'react-icons/fi';
// Glass styles replaced with Tailwind classes - createGlassStyle removed
import Button from './Button';
import { ExportFormat } from '../../utils/exportData';
import logger from '../../utils/logger';

interface ExportButtonProps {
  data: any[];
  onExport: (data: any[], format: ExportFormat) => void;
  filename?: string;
  disabled?: boolean;
  className?: string;
  buttonText?: string;
  modalTitle?: string;
  includeFormats?: ExportFormat[];
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  onExport,
  filename,
  disabled = false,
  className = '',
  buttonText = 'Export Data',
  modalTitle = 'Export Data',
  includeFormats = ['csv', 'json', 'txt'],
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const formatInfo = {
    csv: {
      icon: <FiFileText className="w-6 h-6" />,
      label: 'CSV',
      description: 'Spreadsheet compatible format',
      color: 'from-green-400 to-green-600',
    },
    json: {
      icon: <FiCode className="w-6 h-6" />,
      label: 'JSON',
      description: 'JavaScript Object Notation',
      color: 'from-blue-400 to-blue-600',
    },
    txt: {
      icon: <FiFile className="w-6 h-6" />,
      label: 'Text',
      description: 'Plain text format',
      color: 'from-gray-400 to-gray-600',
    },
  };

  const handleExport = async () => {
    if (!data || data.length === 0) {
      logger.warn('No data to export');
      return;
    }

    setIsExporting(true);
    try {
      await onExport(data, selectedFormat);
      setShowModal(false);
      logger.info('Export completed', { format: selectedFormat, records: data.length });
    } catch (error) {
      logger.error('Export failed', { error });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        disabled={disabled || !data || data.length === 0}
        variant="secondary"
        gradient={true}
        className={`${className} flex items-center gap-2`}
      >
        <FiDownload className="w-4 h-4" />
        {buttonText}
      </Button>

      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={() => setShowModal(false)}
            >
              <div
                className="bg-gradient-to-br from-white/80 to-white/90 dark:from-gray-800/80 dark:to-gray-800/90 backdrop-blur-2xl border border-white/30 dark:border-gray-600/30 shadow-2xl rounded-3xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {modalTitle}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-sm p-2 rounded-full hover:scale-110 transition-transform"
                  >
                    <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Format Selection */}
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Select export format for {data.length} records
                  </p>
                  
                  {includeFormats.map((format) => {
                    const info = formatInfo[format];
                    return (
                      <motion.button
                        key={format}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedFormat(format)}
                        className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                          selectedFormat === format
                            ? `bg-gradient-to-r ${info.color} text-white shadow-lg`
                            : 'bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-sm rounded-xl'
                        }`}
                      >
                        <div className={selectedFormat === format ? 'text-white' : 'text-gray-600 dark:text-gray-400'}>
                          {info.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold">{info.label}</div>
                          <div className={`text-xs ${
                            selectedFormat === format 
                              ? 'text-white/80' 
                              : 'text-gray-500 dark:text-gray-500'
                          }`}>
                            {info.description}
                          </div>
                        </div>
                        {selectedFormat === format && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                          >
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 dark:border-gray-600/30 shadow-md rounded-full flex-1 px-4 py-3 font-medium hover:scale-105 transition-transform"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    variant="primary"
                    gradient={true}
                    className="flex-1"
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <FiDownload className="w-4 h-4 mr-2" />
                        Export
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExportButton;