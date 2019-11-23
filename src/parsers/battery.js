const parseDecToBinary = require('../utils/parseDecToBinary');

/**
 *
 * @param {Array} data
 * @return {Object}
 */
const parseBattery = (data) => {
  const voltage = parseInt(`${parseDecToBinary(data[0])}${parseDecToBinary(data[1])}`, 2) / 100;

  return {
    voltage,
  };
};

module.exports = parseBattery;
