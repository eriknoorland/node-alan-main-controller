const Transform = require('stream').Transform;
const cobs = require('cobs');
const parseDecToBinary = require('./utils/parseDecToBinary');
const parseBattery = require('./utils/parseBattery');
const parseTicks = require('./utils/parseTicks');
const parseImu = require('./utils/parseImu');
const numDescriptorBytes = 4;

/**
 * Parser
 */
class Parser extends Transform {
  /**
   * Constructor
   */
  constructor() {
    super();

    this.startFlags = Buffer.from([0xA5, 0x5A]);
    this.buffer = Buffer.alloc(0);
  }

  /**
   * Transform
   * @param {Buffer} chunk
   * @param {String} encoding
   * @param {Function} callback
   */
  _transform(chunk, encoding, callback) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    for (let j = 0; j < this.buffer.length; j++) {
      if (this.buffer.indexOf(this.startFlags, 0, 'hex') !== -1) {
        const packetStart = this.buffer.indexOf(this.startFlags, 0, 'hex') - 1;

        if (this.buffer.length > packetStart + numDescriptorBytes) {
          const command = this.buffer[packetStart + 3];
          const dataLength = this.buffer[packetStart + 4];

          if (this.buffer.length > packetStart + numDescriptorBytes + dataLength + 2) {
            const packetEnd = packetStart + numDescriptorBytes + dataLength + 2;
            const packet = this.buffer.slice(packetStart, packetEnd);
            const decodedPacket = cobs.decode(packet);
            const packetData = [];

            this.buffer = this.buffer.slice(packetEnd);
            j = 0;

            for (let i = 0; i < dataLength; i++) {
              const index = numDescriptorBytes + i;
              packetData.push(decodedPacket[index]);
            }

            switch(command) {
              case 0xFF:
                this.emit('ready');
                break;

              case 0x10:
              case 0x15:
              case 0x20:
              case 0x25:
                this.emit('targetReached');
                break;

              case 0x45:
                this.emit('battery', parseBattery(packetData));
                break;

              case 0x50:
                this.emit('imu', parseImu(packetData));
                break;

              case 0x55:
                this.emit('ticks', parseTicks(packetData));
                break;
            }
          }
        }
      }
    }

    callback();
  }
}

module.exports = Parser;
