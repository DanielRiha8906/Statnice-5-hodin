const http = require('node:http');

const HEADER_NAME = 'X-React-Native-Project-Root';
const originalSetHeader = http.ServerResponse.prototype.setHeader;

http.ServerResponse.prototype.setHeader = function setHeader(name, value) {
  if (typeof name === 'string' && name.toLowerCase() === HEADER_NAME.toLowerCase() && typeof value === 'string') {
    // React Native exposes the project root only for diagnostics; percent-encoding
    // keeps the information intact while making the header safe for Node's validator.
    value = encodeURI(value);
  }

  return originalSetHeader.call(this, name, value);
};
