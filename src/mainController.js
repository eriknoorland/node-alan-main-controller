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
      port.on('open', onPortOpen.bind(null, resolve));

      parser.on('data', (data) => {
        try {
          eventEmitter.emit('data', JSON.parse(data));
        } catch(error) {}
      });
    });
  }

  /**
   * Forward
   * @return {Promise}
   */
  function moveForward() {
    return new Promise((resolve) => {
      port.write([0xA5, 0x10, 0x10]);
      resolve();
    });
  }

  /**
   * Backward
   * @return {Promise}
   */
  function moveBackward() {
    return new Promise((resolve) => {
      port.write([0xA5, 0x15, 0x10]);
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
   * Set LED color
   * @return {Promise}
   */
  function setLedColor(red, green, blue) {
    return new Promise((resolve) => {
      port.write([0xA5, 0x35, 0xFF, 0x00, 0xFF]);
      resolve();
    });
  }

  /**
   * Port open event handler
   * @param {Function} resolve
   */
  function onPortOpen(resolve) {
    port.flush(error => {
      if (error) {
        eventEmitter.emit('error', error);
      }

      state = State.IDLE;
      resolve();
    });
  }

  constructor();

  return {
    init,
    moveForward,
    moveBackward,
    rotate,
    turn,
    setLedColor,
    on: eventEmitter.on.bind(eventEmitter),
  };
};

module.exports = mainController;
