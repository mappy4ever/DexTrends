// Scroll handler utilities - extracted from _app.tsx

// Scroll handler state and callbacks
let scrollTimer: NodeJS.Timeout;
let scrollHandlerIsScrolling = false;
let scrollStateSetters: {
  setIsScrolling?: React.Dispatch<React.SetStateAction<boolean>>;
} = {};

// Scroll handler object to avoid function detection issues
export const scrollHandlerUtils = {
  handleScroll: () => {
    if (!scrollHandlerIsScrolling) {
      document.body.classList.add('is-scrolling');
      scrollStateSetters.setIsScrolling?.(true);
      scrollHandlerIsScrolling = true;
    }
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      document.body.classList.remove('is-scrolling');
      scrollStateSetters.setIsScrolling?.(false);
      scrollHandlerIsScrolling = false;
    }, 150);
  },
  cleanup: () => {
    clearTimeout(scrollTimer);
    scrollStateSetters = {};
  },
  setStateSetters: (setters: typeof scrollStateSetters) => {
    scrollStateSetters = setters;
  }
};