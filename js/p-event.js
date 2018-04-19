export default {
    init(tree, handler) {
        let body = document.body;
        body.addEventListener('mousemove', (evt) => {
            tree.hover(evt);
        });
        body.addEventListener('click', (evt) => {
            if (!handler.click(evt, tree)) {
                tree.click(evt);
            }
        });
    }
}