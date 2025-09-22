
class CustomButton extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `<h1>hola</h1>`
    }
}


window.customElements.define('custom-button', CustomButton);