const assert = require('chai').assert;
const fs     = require('node-fs');
const util   = require('util');
const parser = require('../index');

describe('htmlParser', function() {
    it('parse() should return correct json', function() {
        const html   = fs.readFileSync('test/files/page.html').toString();
        const schema = JSON.parse(fs.readFileSync('test/files/schema.json').toString());
        const expect = JSON.parse(fs.readFileSync('test/files/page.json').toString());
        const json   = parser.parse(html, schema);

        assert.equal(expect, json);
    });
});