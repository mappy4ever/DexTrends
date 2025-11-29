import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiX, FiFileText, FiFile, FiCode } from 'react-icons/fi';
import { createGlassStyle } from './design-system/glass-constants';
import { GradientButton } from './design-system';
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
      color: 'from-amber-400 to-amber-600',
    },
    txt: {
      icon: <FiFile className="w-6 h-6" />,
      label: 'Text',
      description: 'Plain text format',
      color: 'from-stone-400 to-stone-600',
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
      <GradientButton
        onClick={() => setShowModal(true)}
        disabled={disabled || !data || data.length === 0}
        variant="secondary"
        className={`${className} flex items-center gap-2`}
      >
        <FiDownload className="w-4 h-4" />
        {buttonText}
      </GradientButton>

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
                className={`${createGlassStyle({
                  blur: '3xl',
                  opacity: 'strong',
                  gradient: true,
                  border: 'strong',
                  shadow: 'glow',
                  rounded: 'xl',
                })} p-6 rounded-xl max-w-md w-full`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-pink-600 bg-clip-text text-transparent">
                    {modalTitle}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className={`${createGlassStyle({
                      blur: 'sm',
                      opacity: 'subtle',
                      gradient: false,
                      border: 'subtle',
                      shadow: 'sm',
                      rounded: 'full',
                    })} p-2 rounded-full hover:scale-110 transition-transform`}
                  >
                    <FiX className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  </button>
                </div>

                {/* Format Selection */}
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
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
                            : createGlassStyle({
                                blur: 'md',
                                opacity: 'subtle',
                                gradient: false,
                                border: 'subtle',
                                shadow: 'sm',
                                rounded: 'xl',
                              })
                        }`}
                      >
                        <div className={selectedFormat === format ? 'text-white' : 'text-stone-600 dark:text-stone-400'}>
                          {info.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold">{info.label}</div>
                          <div className={`text-xs ${
                            selectedFormat === format
                              ? 'text-white/80'
                              : 'text-stone-500 dark:text-stone-500'
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
                    className={`${createGlassStyle({
                      blur: 'md',
                      opacity: 'medium',
                      gradient: false,
                      border: 'medium',
                      shadow: 'md',
                      rounded: 'full',
                    })} flex-1 px-4 py-3 rounded-full font-medium hover:scale-105 transition-transform`}
                  >
                    Cancel
                  </button>
                  <GradientButton
                    onClick={handleExport}
                    disabled={isExporting}
                    variant="primary"
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
                  </GradientButton>
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