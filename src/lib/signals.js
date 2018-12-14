const request = require('request');

const backendUrl = 'http://localhost:27301';
const headers = {
  "Content-Type": "application/json"
}
const pid = 'DK5QPID';

const sendColorSignal = (key, color) => {
  sendSignal({
    zoneId: key,
    color,
    effect: 'SET_COLOR',
    pid
  });
};

const sendSignal = (signal) => {
  request.post({
    url: `${backendUrl}/api/1.0/signals`,
    headers: headers,
    body: signal,
    json: true
  }, (error, response) => {
    if (error) {
      console.error(error);
    }
  });
};

const clearSignal = (key) => {
  request.delete({
    url: `${backendUrl}/api/1.0/signals/pid/${pid}/zoneId/${key}`,
    headers: headers,
    json: true
  }, (error, response) => {
    if (error) {
      console.error(error);
    }
  });
};

module.exports = {
  sendColorSignal,
  clearSignal
}
