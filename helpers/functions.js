const titleCase = (str) => {
  const strng = typeof str === 'string' ? str : '';
  return strng.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
};

module.exports = {
  titleCase,
};
