/**
 * 
 * @param {Array} data
 * @return {Object}
 */
const parseTicks = (data) => {
  return {
    left: data[0] || 0,
    right: data[1] || 0,
  };
};

module.exports = parseTicks;
