import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { before } from 'mocha';

before('setting up enzyme', () => {
  configure({ adapter: new Adapter() });
});
