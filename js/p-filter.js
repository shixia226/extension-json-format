import '../scss/p-filter.scss';

import Util from './p-util';
import Toast from './p-toast';

let elem, callback, sxpjson;

export default {
    show(cb) {
        if (!elem) {
            elem = document.body.appendChild(document.createElement('div'));
            elem.className = 'p-filter';
            elem.innerHTML = '<div class="history-list"><div class="title">' + chrome.i18n.getMessage('titleHistory') + '</div><ul></ul></div><div class="content"><textarea placeholder="' + chrome.i18n.getMessage('expressInfo') + '"></textarea><div class="buttons"><span handler="apply" class="btn">' + chrome.i18n.getMessage('btnApply') + '</span><span handler="save" class="btn">' + chrome.i18n.getMessage('btnSave') + '</span><span handler="hide" class="btn">' + chrome.i18n.getMessage('btnClose') + '</span></div></div>';
            initHistoryList(elem.firstChild.lastChild);
            elem.addEventListener('click', evtMouseClick);
        }
        elem.style.display = '';
        elem.querySelector('textarea').focus();
        callback = cb;
    }
}

const handlers = {
    save() {
        let value = elem.querySelector('textarea').value,
            select = elem.querySelector('ul > li.selected'),
            updateMsg, updateFunc;
        if (!value) {
            if (select) {
                if (confirm(chrome.i18n.getMessage('confirmDelete', [select.innerHTML]))) {
                    sxpjson.splice(select.getAttribute('index'), 1);
                    updateMsg = chrome.i18n.getMessage('successDelete');
                    updateFunc = 'removeChild';
                }
            }
        } else {
            if (select) {
                if (confirm(chrome.i18n.getMessage('confirmUpdate', [select.innerHTML]))) {
                    sxpjson[select.getAttribute('index')].value = value;
                    updateMsg = chrome.i18n.getMessage('successUpdate');
                }
            } else {
                let name = prompt(chrome.i18n.getMessage('promtInput'));
                select = document.createElement('li');
                select.setAttribute('index', sxpjson.length);
                select.innerHTML = name;
                sxpjson.push({ name: name, value: value });
                updateMsg = chrome.i18n.getMessage('successSave');
                updateFunc = 'appendChild'
            }
        }
        if (updateMsg) {
            chrome.storage.sync.set({ sxpjson: JSON.stringify(sxpjson) }, function() {
                if (updateFunc) {
                    elem.querySelector('ul')[updateFunc](select);
                }
                Toast.show(updateMsg);
            });
        }
    },
    apply() {
        Util.call(callback, null, elem.querySelector('textarea').value);
    },
    hide() {
        elem.style.display = 'none';
    }
}

function evtMouseClick(evt) {
    let elem = evt.target;
    if (elem.nodeType === 3) elem = elem.parentNode;
    var handler = elem.getAttribute('handler');
    if (handler) {
        Util.call(handlers[handler], elem);
    } else {
        let tagName = elem.tagName.toLowerCase();
        if (tagName === 'li') {
            let selected = this.querySelector('ul > li.selected');
            if (selected) {
                selected.classList.remove('selected');
                if (selected === elem) return;
            }
            elem.classList.add('selected');
            this.querySelector('textarea').value = sxpjson[elem.getAttribute('index')].value;
            handlers.apply();
        } else if (tagName === 'ul') {
            let selected = this.querySelector('ul > li.selected');
            if (selected) {
                selected.classList.remove('selected');
            }
        }
    }
}

function initHistoryList(elem) {
    chrome.storage.sync.get({ sxpjson: '' }, function(items) {
        sxpjson = items.sxpjson;
        if (sxpjson) {
            sxpjson = JSON.parse(sxpjson);
            let html = [];
            for (let i = 0, len = sxpjson.length; i < len; i++) {
                let json = sxpjson[i];
                html.push('<li index=', i, ' >', json.name, '</li>');
            }
            elem.innerHTML = html.join('');
        } else {
            sxpjson = [];
        }
    });
}