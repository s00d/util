import chai from 'chai'
import sinonChai from 'sinon-chai'
import Promise from 'nuo'

localStorage.clear()

chai.use(sinonChai)

global.Promise = Promise
global.assert = chai.assert
global.expect = chai.expect

// require all test files (files that ends with .spec.js)
const testsContext = require.context('./', true, /^\.[/\\]((?!node_modules).)*\.spec\.js$/)
testsContext.keys().forEach(testsContext)

// require all src files except index.js for coverage.
// you can also change this to match only the subset of files that
// you want coverage for.
const componentsContext = require.context('../../', true, /^\.[/\\]((?!index|test|coverage|node_modules).)*(\.js)$/)
componentsContext.keys().forEach(componentsContext)
