<h1 align="center">Declarative html parser</h1>

<h5 align="center">
    <p>Convers HTML to JSON using simple schema. </p>
    <p>Designed for avoiding writing a lot of similar code of parsers.</p>
</h5>

## Installation
`npm install dec-html-parser`

## Example

HTML page for parsing
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Page Title</title>
</head>
<body>

    Date: <span class="date">2017-01-03</span>

    <ul id="tag-list">
        <li>tag1</li>
        <li>tag2</li>
        <li>tag3</li>
    </ul>
    
    <table id="author-table">
        <tr>
            <td><a href="/fill-davis">Fill Davis</a></td>
            <td><span>AGE: 25</span></td>
            <td><span>34 articles</span></td>
        </tr>
    
        <tr>
            <td><a href="/nick-peterson">Nick Peterson</a></td>
            <td><span>AGE: 31</span></td>
            <td><span>110 articles</span></td>
        </tr>
    
        <tr>
            <td><a href="/nick-peterson">July Mai</a></td>
            <td><span>AGE: 18</span></td>
            <td><span>3 articles</span></td>
        </tr>
    </table>
</body>
</html>
```

```js
const parser = require('dec-html-parser');

const schema = {
     "page": {
         "type": "single",
         "props": {
             "name": "title",
             "tags": {
                 "type" : "collection",
                 "css"  : "#tag-list li"
             },
             "authors" : {
                 "type"  : "collection",
                 "css"   : "#author-table tr",
                 "props" : {
                     "name"     : ["td", ["eq", 0], ["find", "a"]],
                     "href"     : ["td", ["eq", 0], ["find", "a"], ["attr", "href"]],
                     "age"      : ["td", ["eq", 1], ["replace", "AGE: ", ""], "parseInt"],
                     "articles" : ["td", ["eq", 2], ["match", "([0-9]+)"], "shift"]
                 }
             }
         }
     }
 };

const html = 'html here';
const json = parser.parse(html, schema);

console.log(json);
```

output
```js
{
    "page": {
        "name": "Page Title",
        "tags": ["tag1", "tag2", "tag3"],
        "authors":[
            {
                "name": "Fill Davis",
                "href": "/fill-davis",
                "age": 25,
                "articles": "34"
            },
            {
                "name": "Nick Peterson",
                "href": "/nick-peterson",
                "age": 31,
                "articles": "110"
            },
            {
                "name": "July Mai",
                "href": "/nick-peterson",
                "age": 18,
                "articles": "3"
            }
        ]
    }
}
```

