import config from './config';

export default {

  fontFamily: 'Gotham Rounded SSm A","Gotham Rounded SSm B", Arial, Georgia, Serif',
  palette: {
    textColor: '#fff',
    primary1Color: config.theme.colors.primary,
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
    headerColor: config.theme.colors.primary,
    selectTextColor: '#fff',
    clockCircleColor: '#eef1f3',
  },
  dialog: {
    bodyColor: '#888',
  },
};
