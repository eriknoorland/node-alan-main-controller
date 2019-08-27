/**
 * Returns a hex value based on the given number
 * @param {Number} value
 * @return {String}
 */
const numberToHex = (value) => {
  return `0x${('00' + value.toString(16)).substr(-2).toUpperCase()}`;
}

module.exports = numberToHex;
