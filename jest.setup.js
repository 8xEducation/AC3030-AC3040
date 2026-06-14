const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('The current testing environment is not configured to support act(...)') ||
     args[0].includes('not wrapped in act(...)') ||
     args[0].includes('overlapping act() calls'))
  ) {
    return;
  }
  originalConsoleError(...args);
};
