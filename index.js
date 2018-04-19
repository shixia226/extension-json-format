document.addEventListener('DOMContentLoaded', function() {
    var match = document.body.innerHTML.match(/^(<pre [^>]*> *)?([\{\[][\S\s]+[\}\]])( *<\/pre>)?$/);
    if (match) {
        try {
            let json = require('./js/p-util').default.parseJSON(match[2]);
            document.body.innerHTML = '';
            let Handler = require('./js/p-buttons').default.init();
            let Tree = require('./js/p-tree').default;
            require('./js/p-event').default.init(new Tree(json), Handler);
        } catch (e) {
            console.log(e);
            console.log('Invalid JSON.');
        }
    }
});