/* eslint-disable no-console */
exports.command = function debug(...args) {
  try {
    this.perform(() => {
      console.log(new Date(), ...args);
    });
    // this.pause(150);
  } catch (E) {
    console.log('ups:', E);
  }
  return this;
};
