let textarea;
export default {
    set(value) {
        if (!textarea) {
            textarea = document.body.appendChild(document.createElement('textarea'));
            textarea.style.cssText = '; position: absolute; width: 0; height: 0; left: -999px; top: -999px;';
        }
        textarea.value = value;
        textarea.select();
        document.execCommand('copy');
    }
}