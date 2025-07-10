// components/ui/PokemonCardSkeleton.js
/**
 * @param {object} props
 * @param {'grid' | 'list'} props.viewMode
 * @param {'compact' | 'regular' | 'large'} [props.cardSize='regular']
 */
const PokemonCardSkeleton = ({ viewMode, cardSize = 'regular' }: any) => {
  const sizeClasses: Record<string, string> = {
    compact: 'w-22 h-22 sm:w-28 sm:h-28',
    regular: 'w-32 h-32 sm:w-36 sm:h-36',
    large: 'w-40 h-40 sm:w-44 sm:h-44 lg:w-48 lg:h-48',
  };
  const currentImageSizeClass = sizeClasses[cardSize] || sizeClasses['regular'];

  if (viewMode === 'grid') {
    return (
      <div className="animate-pulse flex flex-col items-center rounded-xl bg-white dark:bg-gray-800 p-4 border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
        <div className={`bg-gray-300 dark:bg-gray-700 rounded-lg ${currentImageSizeClass} mb-3`}></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="flex gap-1.5 mt-1">
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-10"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-10"></div>
        </div>
      </div>
    );
  }

  // List view skeleton
  return (
    <div className="animate-pulse flex items-center bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-300 dark:bg-gray-700 mr-5"></div>
      <div className="flex-grow">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/5 mb-2.5"></div>
        <div className="flex gap-1.5 mt-1">
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
        </div>
      </div>
    </div>
  );
};
export default PokemonCardSkeleton;
