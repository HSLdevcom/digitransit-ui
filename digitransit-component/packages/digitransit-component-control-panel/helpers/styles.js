export function getStyleInput() {
  return {
    width: 200,
  };
}

export function getStyleMain() {
  return {
    display: 'flex',
    order: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '#ffffff',
    height: '100%',
    width: 'calc(100% - 2em)',
    maxWidth: 400,
    zIndex: 20,
    margin: '0 auto',
  };
}

export function getStyleMainBottom() {
  return {
    backgroundColor: '#ffffff',
    width: 'calc(100% - 2em)',
    margin: '0 auto',
    paddingBottom: 32,
  };
}

export function getStyleSeparatorLine() {
  return {
    display: 'block',
    width: '100%',
    marginTop: '1em',
    borderTop: '1px solid #ddd',
    background: '#f4f4f5',
  };
}
