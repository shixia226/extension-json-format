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
    filter(func, pelem) {
        if (!pelem) {
            pelem = this.root;
            pelem.style.display = 'none';
        }
        pelem.setAttribute('id', '__sizzle__');
        let items, show = false;
        try {
            items = this.root.querySelectorAll('#__sizzle__ > ul > li.item');
        } finally {
            pelem.removeAttribute('id');
        }
        if (items) {
            for (let i = 0, len = items.length; i < len; i++) {
                let item = items[i],
                    level = item.getAttribute('level'),
                    data = this.data,
                    itemShow = false,
                    clsFunc;
                if (level) {
                    level = level.split(',');
                    for (let j = 0, jlen = level.length; j < jlen; j++) {
                        data = data.items[level[j]];
                    }
                    itemShow = Util.call(func, this, data.name, data.data, !item.classList.contains('pitem'), level.length) !== false;
                }
                if (!itemShow) {
                    if ((itemShow = this.filter(func, item))) {
                        item.classList.remove('collapse');
                    }
                } else {
                    let citems = item.querySelectorAll('li.hidden');
                    for (let j = 0, jlen = citems.length; j < jlen; j++) {
                        citems[j].classList.remove('hidden');
                    }
                }
                if (itemShow) {
                    clsFunc = 'remove';
                    show = true;
                } else {
                    clsFunc = 'add';
                }
                if (clsFunc) {
                    item.classList[clsFunc]('hidden');
                }
            }
        }
        if (pelem === this.root) {
            pelem.style.display = '';
        }
        return show;
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