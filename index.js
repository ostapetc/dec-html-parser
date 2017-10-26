const cheerio = require('cheerio')

let htmlParser = {
    domMethods: ['find', 'eq', 'attr', 'first', 'last']
};

htmlParser.parse = function(html, schema) {
    let dom  = cheerio.load(html, {decodeEntities: true});
    let data = {};

    for (let key in schema) {
        if (schema.hasOwnProperty(key)) {
            data[key] = this.parseObject(schema[key], dom);
        }
    }

    return data;
};

htmlParser.parseObject = function(object, dom) {
    if (object['type'] === 'collection') {
        let items  = dom(object['css']);
        let length = items.length;
        let result = [];

        for (let i = 0; i < length; i++) {
            let html = dom(items[i]).html();
            result.push(this.parseObjectProperties(object['props'], cheerio.load(html)));
        }

        return result;
    } else if (object['type'] === 'single') {
        return this.parseObjectProperties(object['props'], dom);
    }
};

htmlParser.parseObjectProperties = function(properties, dom) {
    let result = [];

    for (let name in properties) {
        if (!properties.hasOwnProperty(name)) {
            continue;
        }

        let property = properties[name];
        let value    = null;

        if (property['type'] != null) {
            result[name] = this.parseObject(property, dom);
        } else {
            let selector;
            let methods;

            if (Array.isArray(property)) {
                selector = property[0]
                methods  = property.slice(1);
            } else {
                selector = property;
            }

            let node = dom(selector);

            if (methods) {
                let grouped = this.groupMethods(methods);

                if (grouped.query.length) {
                    value = this.findDomValue(node, grouped.query);
                } else {
                    value = node.text();
                }

                if (value && grouped.modifiers.length) {
                    value = this.modifyValue(value, grouped.modifiers);
                }
            } else {
                value = node.text();
            }

            if (typeof value === 'string') {
                value = value.trim();
            }

            result[name] = value;
        }
    }

    return result;
};

htmlParser.findDomValue = function(node, query) {
    let value;

    for (let data of query) {
        node = node[data.name].apply(node, data.args);
    }

    if (typeof node === 'object') {
        value = node.text();
    } else {
        value = node;
    }

    return value;
};

htmlParser.modifyValue = function(value, modifiers) {
    for (let modifier of modifiers) {
        switch (modifier.name) {
            case 'parseFloat':
                value = parseFloat(value);
                break;

            case 'parseInt':
                value = parseInt(value);
                break;

            default:
                if (typeof value[modifier.name] === 'function') {
                    value = value[modifier.name].apply(value, modifier.args);
                } else {
                    console.error('unknown midifier: ', modifier);
                }
        }

        if (value === null) {
            break;
        }
    }

    return value;
};

htmlParser.groupMethods = function(methods) {
    let grouped = { query: [], modifiers: [] };
    let length  = methods.length;

    for (let i = 0; i < length; i++) {
        let name, args;

        if (Array.isArray(methods[i])) {
            name = methods[i][0];
            args = methods[i].slice(1);
        } else {
            name = methods[i];
        }

        let key = this.domMethods.includes(name) ? 'query' : 'modifiers';

        grouped[key].push({
            name: name,
            args: args
        });
    }

    return grouped;
};

module.exports = htmlParser;