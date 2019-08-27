const cobs = require('cobs');

/**
 * Writes the given buffer to the given port
 * @param {Object} port
 * @param {Array} data
 */
const writeToSerialPort = (port, data) => {
  port.write(cobs.encode(Buffer.from(data), true));
};

module.exports = writeToSerialPort;
