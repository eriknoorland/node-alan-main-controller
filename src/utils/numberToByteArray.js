const numberToByteArray = (number, numBytes) => {
  const byteArray = new Array(numBytes);

  for (var i = byteArray.length - 1; i >= 0; i--) {
    const byte = number & 0xff;

    byteArray[i] = byte;
    number = (number - byte) / 256 ;
  }

  return byteArray;
};

module.exports = numberToByteArray;
