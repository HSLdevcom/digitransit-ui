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
    position: 'absolute',
    height: '100%',
    width: 600,
    minWidth: 600,
    zIndex: 20,
    paddingLeft: 30,
  };
}

export function getStyleMainBottom() {
  return {
    backgroundColor: '#ffffff',
    width: '100%',
    paddingBottom: 32,
    paddingLeft: 10,
  };
}

export function getStyleSeparatorLine() {
  return {
    display: 'block',
    width: 'auto',
    margin: '0 auto',
    marginLeft: 0,
    marginRight: '1em',
    marginTop: '1em',
    borderTop: '1px solid #ddd',
    background: '#f4f4f5',
  };
}
