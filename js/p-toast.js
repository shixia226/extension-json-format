import '../scss/p-toast.scss';

let elem, timeout;
export default {
    show(msg, delay = 3000) {
        clearTimeout(timeout);
        if (!elem) {
            elem = document.body.appendChild(document.createElement('div'));
            elem.className = 'p-toast';
        }
        elem.innerHTML = msg;
        elem.style.display = '';
        timeout = setTimeout(this.hide, delay);
    },
    hide() {
        elem.style.display = 'none';
    }
}