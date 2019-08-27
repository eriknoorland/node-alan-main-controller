const EventEmitter = require('events');
const SerialPort = require('serialport');
const Parser = require('./Parser');
const writeToSerialPort = require('./utils/writeToSerialPort');
const numberToByteArray = require('./utils/numberToByteArray');
const numberToHex = require('./utils/numberToHex');

/**
 * MainController
 * @param {String} path
 * @return {Object}
 */
const mainController = (path) => {
  const eventEmitter = new EventEmitter();

  let port;
  let parser;

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
      parser = new Parser();

      port.pipe(parser);

      port.on('error', error => eventEmitter.emit('error', error));
      port.on('disconnect', () => eventEmitter.emit('disconnect'));
      port.on('close', () => eventEmitter.emit('close'));
      port.on('open', onPortOpen);

      parser.on('ready', resolve);
      parser.on('imu', data => eventEmitter.emit('imu', data));
      parser.on('ticks', data => eventEmitter.emit('ticks', data));
      parser.on('battery', data => eventEmitter.emit('battery', data));
      parser.on('targetReached', data => eventEmitter.emit('targetReached', data));
    });
  }

  /**
   * Forward
   * @param {Number} speed
   * @param {Number} distance
   * @return {Promise}
   */
  function moveForward(speed, distance = 0) {
    writeToSerialPort(port, [0xA5, 0x10, numberToHex(speed), numberToHex(distance)]);

    if (distance) {
      return new Promise((resolve) => {
        const onTargetReached = () => {
          parser.off('targetReached', onTargetReached);
          resolve();
        };

        parser.on('targetReached', onTargetReached);
      });
    }
  }

  /**
   * Backward
   * @param {Number} speed
   * @param {Number} distance
   * @return {Promise}
   */
  function moveBackward(speed, distance = 0) {
    writeToSerialPort(port, [0xA5, 0x15, numberToHex(speed), numberToHex(distance)]);

    if (distance) {
      return new Promise((resolve) => {
        const onTargetReached = () => {
          parser.off('targetReached', onTargetReached);
          resolve();
        };

        parser.on('targetReached', onTargetReached);
      });
    }
  }

  /**
   * Rotate left
   * @param {Number} speed
   * @param {Number} angle
   * @return {Promise}
   */
  function rotateLeft(speed, angle) {
    return rotate(speed, angle, 0);
  }

  /**
   * Rotate right
   * @param {Number} speed
   * @param {Number} angle
   * @return {Promise}
   */
  function rotateRight(speed, angle) {
    return rotate(speed, angle, 1);
  }

  /**
   * Rotate
   * @param {Number} speed
   * @param {Number} angle
   * @param {String} direction
   * @return {Promise}
   */
  function rotate(speed, angle, direction = 0) {
    writeToSerialPort(port, [0xA5, 0x20, numberToHex(speed), numberToHex(angle), numberToHex(direction)]);

    return new Promise((resolve) => {
      const onTargetReached = () => {
        parser.off('targetReached', onTargetReached);
        resolve();
      };

      parser.on('targetReached', onTargetReached);
    });
  }

  /**
   * Turn left
   * @param {Number} speed
   * @param {Number} angle
   * @param {Number} radius
   * @return {Promise}
   */
  function turnLeft(speed, angle, radius) {
    return rotate(speed, angle, radius, 0);
  }

  /**
   * Turn right
   * @param {Number} speed
   * @param {Number} angle
   * @param {Number} radius
   * @return {Promise}
   */
  function turnRight(speed, angle, radius) {
    return rotate(speed, angle, radius, 1);
  }

  /**
   * Turn
   * @param {Number} speed
   * @param {Number} angle
   * @param {Number} radius
   * @param {String} direction
   * @return {Promise}
   */
  function turn(speed, angle, radius, direction = 0) {
    writeToSerialPort(port, [0xA5, 0x25, numberToHex(speed), numberToHex(angle), numberToHex(radius), numberToHex(direction)]);

    return new Promise((resolve) => {
      const onTargetReached = () => {
        parser.off('targetReached', onTargetReached);
        resolve();
      };

      parser.on('targetReached', onTargetReached);
    });
  }

  /**
   * Drive
   * @param {Number} speedLeft
   * @param {Number} speedRight
   */
  function drive(speedLeft, speedRight) {
    writeToSerialPort(port, [0xA5, 0x30, numberToHex(speedLeft), numberToHex(speedRight)]);
  }

  /**
   * Stop
   * @param {Number} hard
   * @return {Promise}
   */
  function stop(hard = 0) {
    return new Promise((resolve) => {
      writeToSerialPort(port, [0xA5, 0x35, numberToHex(hard)]);
      setTimeout(resolve, hard ? 0 : 1000);
    });
  }

  /**
   * Enable ticks
   * @return {Promise}
   */
  function enableTicks() {
    writeToSerialPort(port, [0xA5, 0x55]);
    return Promise.resolve();
  }

  /**
   * Disable ticks
   * @return {Promise}
   */
  function disableTicks() {
    writeToSerialPort(port, [0xA5, 0x60]);
    return Promise.resolve();
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
      writeToSerialPort(port, [0xA5, 0x40, numberToHex(red), numberToHex(green), numberToHex(blue)]);
      resolve();
    });
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
    rotateLeft,
    rotateRight,
    turnLeft,
    turnRight,
    drive,
    stop,
    enableTicks,
    disableTicks,
    setLedColor,
    on: eventEmitter.on.bind(eventEmitter),
  };
};

module.exports = mainController;
