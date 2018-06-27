import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { JSDOM } from 'jsdom';
import { before } from 'mocha';

before('setting up enzyme and jsdom', () => {
  const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
  const { window } = jsdom;

  const copyProps = (src, target) => {
    const props = Object.getOwnPropertyNames(src)
      .filter(prop => typeof target[prop] === 'undefined')
      .reduce(
        (result, prop) => ({
          ...result,
          [prop]: Object.getOwnPropertyDescriptor(src, prop),
        }),
        {},
      );
    Object.defineProperties(target, props);
  };

  global.window = window;
  global.document = window.document;
  global.navigator = {
    userAgent: 'node.js',
  };
  copyProps(window, global);

  configure({ adapter: new Adapter() });
});
