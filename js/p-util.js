export default {
    isNull(obj) {
        return obj === null || obj === undefined;
    },
    isObject(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]'
    },
    isArray(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    },
    isFunction(func) {
        return Object.prototype.toString.call(func) === '[object Function]';
    },
    isString(str) {
        return Object.prototype.toString.call(str) === '[object String]';
    },
    call(handler, context) {
        if (!handler) return;
        var args = [].slice.call(arguments, 2);
        if (this.isFunction(handler)) {
            return handler.apply(context, args);
        } else {
            context = handler.context || context;
            args = (handler.args || []).concat(args);
            if (this.isString(handler) || this.isString(handler = handler.handler)) {
                handler = context ? context[handler] : null;
            }
            if (this.isFunction(handler)) {
                return handler.apply(context, args);
            }
        }
    },
    parseJSON(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return (new Function('return ' + str.replace(/&/g, '&amp;').replace(/ /g, '&nbsp;').replace(/[\s]/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')))();
        }
    },
    pelem(elem, cls) {
        if (elem.nodeType === 3) elem = elem.parentNode;
        while (elem && elem.nodeType === 1) {
            if (!cls || elem.classList.contains(cls)) {
                return elem;
            }
            elem = elem.parentNode;
        }
    }
}