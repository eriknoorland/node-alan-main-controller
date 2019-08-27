const parseDecToBinary = require('./parseDecToBinary');

/**
 * 
 * @param {Array} data
 * @return {Object}
 */
const parseImu = (data) => {
  const heading = parseInt(`${parseDecToBinary(data[0])}${parseDecToBinary(data[1])}`, 2);

  return {
    heading,
  };
};

module.exports = parseImu;
