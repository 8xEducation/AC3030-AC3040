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

jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    FlashList: (props) => {
      return (
        <View>
          {props.data && props.data.map((item, index) => (
            <React.Fragment key={index}>
              {props.renderItem({ item, index })}
            </React.Fragment>
          ))}
        </View>
      );
    },
  };
});
