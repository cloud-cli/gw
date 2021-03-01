import { Gateway } from './dist/index.js';
const test = new Gateway();
test.add('test', {});
test.dispatch({ url: '', method: '' }, { writeHead() {}, end() {} });
