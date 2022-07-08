const colors = {
  // Primary
  primary100: '#1b1c1e',
  primary80: '#4b4e54',
  primary60: '#7c8089',
  primary40: '#b2b4b9',
  primary20: '#e7e8ea',
  // accent
  accent: '#38CAF1',
  love: '#e6282b',
  // grey
  grey100: '#0e0e11',
  grey80: '#454655',
  grey60: '#898A9A',
  grey40: '#C0C0CA',
  grey20: '#F6F7FB',
  white: '#fff',
  // Alerts
  errorDark: '#DE405D',
  error: '#FF4567',
  errorLight: '#FFA5B5',
  successDark: '#32A887',
  success: '#70C9B0',
  successLight: '#DBF0F1',
  infoDark: '#4268F6',
  info: '#879FFA',
  infoLight: '#CBD5FD',
  // Backgrounds
  filterBg: '#4b4e54',
  hoverBg: '#7c8089',
  // Elements
  inputBorder: '#C0C0CA',
  separator: '#C0C0CA',
  highlight: '#F6F7FB',
  filterInputBorder: 'rgba(255,255,255,0.15)',
  filterDisabled: 'rgba(83,91,142,0.05)',
  bg: '#F6F7FB',
};

const space = {
  xs: '2px',
  sm: '4px',
  default: '8px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  x3: '48px',
  x4: '64px',
  x5: '80px',
  x6: '128px',
};

const sizes = {
  navbarHeight: '64px',
  sidebarWidth: '300px',
};

const fontSizes = {
  xs: '10px',
  sm: '12px',
  default: '14px',
  lg: '16px',
  xl: '18px',
  h4: '24px',
  h3: '28px',
  h2: '32px',
  h1: '40px',
};

const fontWeights = {
  lighter: 300,
  normal: 400,
  bold: 700,
};

const lineHeights = {
  sm: '12px',
  default: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '40px',
};

const shadows = {
  login: '0 15px 24px 0 rgba(137,138,154,0.15)',
  cardHover: '0 4px 12px 0 rgba(137,138,154,0.4)',
  drawer: '-2px 0 8px 0 rgba(137,138,154,0.2)',
  card: '0 1px 6px 0 rgba(137,138,154,0.4)',
  inputFocus: '0 2px 4px 0 rgba(124, 128, 137, 0.4)',
  buttonFocus: '0 4px 6px 0 rgba(27, 28, 30, 0.3)',
};

const breakpoints = [
  '577px',
  '769px',
  '1024px',
  '1324px',
];

const font = '\'Roboto\', sans-serif';

module.exports = {
  colors,
  lineHeights,
  fontWeights,
  fontSizes,
  sizes,
  space,
  font,
  shadows,
  breakpoints,
};
