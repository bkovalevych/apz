const SerialPort = require("serialport");
const portName = "COM7";

const myPort = new SerialPort(portName, {
    baudRate: 9600
});

myPort.on("open", () => {
    console.log("Open connection");
});

myPort.on("data", (data) => {
    console.log(data.toString());
});

module.exports = myPort;