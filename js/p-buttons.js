import '../scss/p-buttons.scss';

import Util from './p-util';
import Copy from './p-copy';
import Filter from './p-filter';
import Toast from './p-toast';

var handlers = {
    copy: function(tree) {
        Copy.set(tree.serialize());
        Toast.show(chrome.i18n.getMessage('toastCopy'));
    },
    filter: function(tree) {
        let rect = this.getBoundingClientRect();
        Filter.show({
            handler: function(tree, value) {
                try {
                    value = new Function('name', 'value', (/^return /.test(value) ? '' : 'return ') + value);
                    tree.filter(value);
                    Toast.show(chrome.i18n.getMessage('toastSucessFilter'));
                } catch (e) {
                    Toast.show(chrome.i18n.getMessage('toastErrorFilter'));
                }
            },
            args: [tree]
        });
    },
    expand: function(tree) {
        tree.expand();
        Toast.show(chrome.i18n.getMessage('toastExpand'));
    },
    collapse: function(tree) {
        tree.collapse();
        Toast.show(chrome.i18n.getMessage('toastCollapse'));
    }
}

export default {
    init(pelem) {
        let elem = (pelem || document.body).appendChild(document.createElement('div'));
        elem.className = 'p-buttons';
        elem.innerHTML = '<span data-handler="copy" class="btn">' + chrome.i18n.getMessage('btnCopy') + '</span><span data-handler="filter" class="btn">' + chrome.i18n.getMessage('btnFilter') + '</span><span data-handler="expand" class="btn">' + chrome.i18n.getMessage('btnExpand') + '</span><span data-handler="collapse" class="btn">' + chrome.i18n.getMessage('btnCollapse') + '</span>';
        return {
            click(evt, tree) {
                var item = Util.pelem(evt.target, 'btn');
                if (item) {
                    var handler = handlers[item.getAttribute('data-handler')];
                    if (handler) handler.call(item, tree);
                    return true;
                }
            }
        }
    }
}