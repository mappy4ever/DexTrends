// __mocks__/next/router.js

// Default mock implementation
const mockRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(() => Promise.resolve()), // Ensure prefetch returns a promise
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true, // Default to true, can be overridden in tests
  isPreview: false,
};

export const useRouter = jest.fn(() => mockRouter);

// You can also export the mockRouter itself if you need to manipulate it directly in tests
export { mockRouter as actualMockRouter };
