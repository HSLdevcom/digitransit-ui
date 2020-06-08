export default config => ({
  fontFamily: 'Gotham Rounded A, Gotham Rounded B, Arial, Georgia, serif',
  palette: {
    textColor: '#fff',
    primary1Color: config.colors.primary,
  },
  tabs: {
    textColor: '#333',
    selectedTextColor: '#333',
    backgroundColor: '#eef1f3',
  },
  inkBar: {
    backgroundColor: '#fff',
  },
  timePicker: {
    headerColor: config.colors.primary,
    selectTextColor: '#fff',
    clockCircleColor: '#eef1f3',
  },
  dialog: {
    bodyColor: '#888',
  },
});
