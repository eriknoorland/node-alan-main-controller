const EventEmitter = require('events');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const mainController = (path) => {
  const eventEmitter = new EventEmitter();

  let parser;
  let port;

  /**
   * Constructor
   */
  function constructor() {}

  /**
   * Init
   * @return {Promise}
   */
  function init() {
    return new Promise((resolve, reject) => {
      if (port) {
        setTimeout(reject, 0);
      }

      port = new SerialPort(path, { baudRate: 115200 });
      parser = new Readline({ delimiter: '\r\n' });

      port.pipe(parser);

      port.on('error', error => eventEmitter.emit('error', error));
      port.on('disconnect', () => eventEmitter.emit('disconnect'));
      port.on('close', () => eventEmitter.emit('close'));
      port.on('open', onPortOpen);

      parser.on('data', (data) => {
        try {
          const parsedData = JSON.parse(data);

          if (parsedData.status === 'ready') {
            return resolve();
          }

          eventEmitter.emit('data', parsedData);

        } catch(error) {}
      });
    });
  }

  /**
   * Forward
   * @param {Number} speed
   * @return {Promise}
   */
  function moveForward(speed) {
    return new Promise((resolve) => {
      port.write(['0xA5', '0x10', numberToHex(speed)]);
      resolve();
    });
  }

  /**
   * Backward
   * @param {Number} speed
   * @return {Promise}
   */
  function moveBackward(speed) {
    return new Promise((resolve) => {
      port.write(['0xA5', '0x15', numberToHex(speed)]);
      resolve();
    });
  }

  /**
   * Rotate
   * @return {Promise}
   */
  function rotate() {
    return new Promise((resolve) => {
      resolve(); // resolve after feedback
    });
  }

  /**
   * Turn
   * @return {Promise}
   */
  function turn() {
    return new Promise((resolve) => {
      resolve(); // resolve after feedback
    });
  }

  /**
   * Stop
   * @return {Promise}
   */
  function stop() {
    return new Promise((resolve) => {
      port.write([0xA5, 0x35]);
      resolve();
    });
  }

  /**
   * Set LED color
   * @param {Number} red
   * @param {Number} green
   * @param {Number} blue
   * @return {Promise}
   */
  function setLedColor(red, green, blue) {
    return new Promise((resolve) => {
      port.write(['0xA5', '0x40', numberToHex(red), numberToHex(green), numberToHex(blue)]);
      resolve();
    });
  }

  /**
   * Returns a hex value based on the given number
   * @param {Number} value
   * @return {String}
   */
  function numberToHex(value) {
    return `0x${('00' + value.toString(16)).substr(-2).toUpperCase()}`;
  }

  /**
   * Port open event handler
   */
  function onPortOpen() {
    port.flush(error => {
      if (error) {
        eventEmitter.emit('error', error);
      }
    });
  }

  constructor();

  return {
    init,
    moveForward,
    moveBackward,
    rotate,
    turn,
    stop,
    setLedColor,
    on: eventEmitter.on.bind(eventEmitter),
  };
};

module.exports = mainController;
