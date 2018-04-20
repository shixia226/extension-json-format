import '../scss/p-tree.scss';

import Util from './p-util';

export default class Tree {
    constructor(datas, pelem) {
        let fmJson = formatJSON(datas);
        formatJsonSuffix(fmJson);
        let elem = (pelem || document.body).appendChild(document.createElement('div'));
        elem.className = 'p-tree';
        elem.innerHTML = '<ul>' + formatHtml(fmJson, null, 1).join('') + '</ul>';
        this.root = elem;
        this.data = fmJson;
    }
    expand() {
        let item = this.root.querySelector('.pitem.select'),
            selector;
        if (item) {
            item.classList.remove('collapse');
            selector = '.pitem.select';
        } else {
            selector = '';
        }
        let items = this.root.querySelectorAll(selector + ' .item.collapse');
        for (let i = 0, len = items.length; i < len; i++) {
            items[i].classList.remove('collapse');
        }
    }
    collapse() {
        let item = this.root.querySelector('.pitem.select'),
            selector;
        if (item) {
            item.classList.add('collapse');
            selector = '.pitem.select';
        } else {
            selector = '';
        }
        let items = this.root.querySelectorAll(selector + ' .item:not(.collapse)');
        for (let i = 0, len = items.length; i < len; i++) {
            items[i].classList.add('collapse');
        }
    }
    filter(func) {
        this.root.style.display = 'none';
        let items = [].slice.apply(this.root.querySelectorAll('li.item'));
        handlerFilter(func, this.data, this.root, items, items.length, 0);
        this.root.style.display = '';
    }
    serialize() {
        let item = this.root.querySelector('.item.select') || this.root;
        item = item.cloneNode(true);
        let items = item.querySelectorAll('.item.hidden');
        for (let i = 0, len = items.length; i < len; i++) {
            items[i].parentNode.removeChild(items[i]);
        }
        let str = item.innerHTML.replace(/<span class="text-collapse">((?!<ul).)+/g, '').replace(/<[^>]+>/g, '').trim().replace(/,$/, '');
        try {
            str = JSON.stringify(Util.parseJSON(str.charAt(0) === '{' ? str : '{' + str + '}'), null, 4);
        } catch (e) {}
        return str;
    }
    hover(evt) {
        let item = this.root.querySelector('.item.hover');
        if (item) {
            item.classList.remove('hover');
        }
        item = Util.pelem(evt.target, 'item');
        if (item) {
            item.classList.add('hover');
        }
    }
    click(evt) {
        let item = this.root.querySelector('.item.select');
        if (item) {
            item.classList.remove('select');
        }
        item = Util.pelem(evt.target, 'item');
        if (item) {
            if (item.classList.contains('pitem')) {
                let rect = item.getBoundingClientRect(),
                    left = evt.pageX - rect.left,
                    top = evt.pageY - document.body.scrollTop - rect.top;
                if (left > 0 && left < 20 && top > 5 && top < 25) { //展开或收拢
                    item.classList.toggle('collapse');
                }
            }
            item.classList.add('select');
        }
    }
}

function sortByName(obj1, obj2) {
    return obj1.text > obj2.text ? 1 : -1;
}

/**
 * 
 * @param {*} json 
 *  {
 *      text: '{',
 *      items: [{
 *          text: '"status": {',
 *          items: [{
 *              text: '"code": 0'
 *          }],
 *          suffix: '}'
 *      }, {
 *          text: '"data: ["',
 *          items: [],
 *          suffix: ']'
 *      }],
 *      suffix: '}'
 *  }
 */
function formatJSON(json, name) {
    let text = name ? '<label>' + JSON.stringify(name) + '</label>: ' : '';
    if (Util.isNull(json)) {
        return {
            text: text + 'null',
            name: name,
            data: json
        };
    }
    if (Util.isObject(json)) {
        let items = [];
        for (let key in json) {
            items.push(formatJSON(json[key], key));
        }
        items.sort(sortByName);
        return {
            text: text + '{',
            items: items,
            suffix: '}',
            name: name,
            data: json
        };
    }
    if (Util.isArray(json)) {
        let items = [];
        for (let i = 0, len = json.length; i < len; i++) {
            items.push(formatJSON(json[i]));
        }
        return {
            text: text + '[',
            items: items,
            suffix: ']',
            name: name,
            data: json
        };
    }
    return {
        text: text + JSON.stringify(json),
        name: name,
        data: json
    };
}

function formatJsonSuffix(json, prev, level = '') {
    json.level = level;
    if (prev) {
        json.suffix = (json.suffix || '') + ','
    }
    if (level) level += ',';
    let items = json.items;
    if (items) {
        let len = items.length - 1;
        for (let i = 0; i < len; i++) {
            formatJsonSuffix(items[i], true, level + i);
        }
        if (len >= 0) {
            formatJsonSuffix(items[len], false, level + len);
        }
    }
}

function formatHtml(json, html, level) {
    if (!html) html = [];
    let items = json.items;
    if (items) {
        let itemLen = items.length,
            inner = [];
        for (let i = 0; i < itemLen; i++) {
            formatHtml(items[i], inner, level - 1);
        }
        if (itemLen > 0) {
            html.push('<li class="item pitem', level > 0 ? '' : ' collapse', '" level="', json.level, '"><span class="text-expand">', json.text, '</span><span class="text-collapse">', json.text, '<span>...</span>', json.suffix, '<span> // ', itemLen, itemLen === 1 ? ' item' : ' items', '</span>', '</span><ul>', inner.join(''), '<li class="suffix"><span>', json.suffix, '</span></li></ul></li>');
        } else {
            html.push('<li class="item" level="', json.level, '"><span>', json.text, json.suffix, '</span></li>');
        }
    } else {
        html.push('<li class="item" level="', json.level, '" title="', json.data, '"><span>', json.text, json.suffix, '</span></li>');
    }
    return html;
}

function getNextItem(item, root) {
    while (item !== root) {
        let nextItem = item.nextSibling;
        if (nextItem && nextItem.classList.contains('item')) return nextItem;
        item = item.parentNode.parentNode;
    }
}

function handlerFilter(func, data, root, items, len, idx) {
    let boundry = idx + 2000;
    while (idx < len) {
        let item = items[idx],
            level = item.getAttribute('level'),
            idata = data;
        if (level) {
            level = level.split(',');
            for (let j = 0, jlen = level.length; j < jlen; j++) {
                idata = idata.items[level[j]];
            }
            let itemCls = item.classList,
                leaf = !itemCls.contains('pitem');
            if (Util.call(func, null, idata.name, idata.data, leaf, level.length) !== false) { //该节点显示
                if (!leaf) {
                    let nitem = getNextItem(item, root);
                    if (nitem) {
                        let nidx = items.indexOf(nitem) - 1;
                        while (idx < nidx) {
                            let cls = items[++idx].classList;
                            if (cls.contains('hidden')) {
                                cls.remove('hidden');
                            }
                            if (cls.contains('pitem') && !cls.contains('collapse')) {
                                cls.add('collapse')
                            }
                        }
                    } else {
                        idx = len;
                    }
                }
                while (item !== root) { //显示该节点及其上级
                    let cls = item.classList;
                    if (cls.contains('hidden')) {
                        cls.remove('hidden');
                    }
                    if (cls.contains('collapse')) {
                        cls.remove('collapse');
                    }
                    item = item.parentNode.parentNode;
                }
                if (!leaf) {
                    itemCls.add('collapse');
                }
            } else {
                itemCls.add('hidden');
            }
        }
        idx++;
        if (idx >= boundry) {
            setTimeout(handlerFilter, 10, func, data, root, items, len, idx);
            break;
        }
    }
}