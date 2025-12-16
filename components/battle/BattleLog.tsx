/**
 * BattleLog Component
 *
 * Displays the battle log with scrollable history.
 */

import React, { memo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { cn } from '@/utils/cn';
import type { BattleLog as BattleLogEntry } from '@/hooks/useBattleSimulator';

interface BattleLogProps {
  logs: (BattleLogEntry | string)[];
  className?: string;
  maxHeight?: string;
}

const LogEntry = memo(({ log, index }: { log: BattleLogEntry | string; index: number }) => {
  // Handle string logs from Quick Battle
  if (typeof log === 'string') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-3 rounded-lg text-sm bg-white/80 dark:bg-stone-700/80 border border-stone-200/50 dark:border-stone-600/50"
      >
        <span className="text-stone-600 dark:text-stone-300">{log}</span>
      </motion.div>
    );
  }

  // Handle BattleLog objects from Interactive Battle
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'p-3 rounded-lg text-sm border',
        log.critical
          ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700'
          : log.effectiveness && log.effectiveness > 1
          ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
          : log.effectiveness && log.effectiveness < 1
          ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="font-semibold text-stone-700 dark:text-stone-200">
            {log.player}
          </span>
          <span className="text-stone-500 dark:text-stone-400 mx-2">•</span>
          <span className="font-medium capitalize text-stone-600 dark:text-stone-300">
            {log.pokemon}
          </span>
        </div>
        <span className="text-xs text-stone-400 dark:text-stone-500">
          {new Date(log.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-stone-600 dark:text-stone-300">{log.action}</span>
        {log.damage && (
          <span className="font-bold text-red-600 dark:text-red-400">
            -{log.damage} HP
          </span>
        )}
        {log.effectiveness && log.effectiveness !== 1 && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-lg',
              log.effectiveness > 1
                ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
            )}
          >
            {log.effectiveness > 1 ? 'Super Effective!' : 'Not Very Effective'}
          </span>
        )}
        {log.critical && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
            Critical Hit!
          </span>
        )}
      </div>
    </motion.div>
  );
});

LogEntry.displayName = 'LogEntry';

export const BattleLog: React.FC<BattleLogProps> = memo(({ logs, className, maxHeight = '256px' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  if (logs.length === 0) return null;

  return (
    <Container variant="default" className={cn('p-6', className)}>
      <h3 className="text-lg font-semibold mb-3 text-stone-700 dark:text-stone-200">
        Battle Log
      </h3>
      <div
        ref={scrollRef}
        className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 overflow-y-auto space-y-2 border border-stone-200 dark:border-stone-700"
        style={{ maxHeight }}
      >
        <AnimatePresence>
          {logs.map((log, index) => (
            <LogEntry key={index} log={log} index={index} />
          ))}
        </AnimatePresence>
      </div>
    </Container>
  );
});

BattleLog.displayName = 'BattleLog';

export default BattleLog;
