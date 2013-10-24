Lightweight proxy builder.

### Composition

```javascript
var sproxy = require('sproxy');

var proxy = sproxy().
            on('/*').
            pipe({
                scheme : 'http',
                host : 'localhost',
                port : '3001',
                path : '/foo'
            });

var server = http.createServer(proxy);
```

### Configuration

```javascript
var sproxy = require('sproxy');

var server = http.createServer(sproxy({
    '/foo' : {
        scheme : 'http',
        host : 'localhost',
        port : '3003',
        path : '/bar'
    }
}));
```