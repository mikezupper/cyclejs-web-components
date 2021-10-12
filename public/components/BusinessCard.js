const isolate = CycleIsolate.default;
import { useCycleMixin } from "/scripts/cycle-web-components.js";
class BusinessCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
    <style>
        .card {
            margin:20px;
            padding: 12px;
            border: 4px solid orange;
            background: #ccc;
            width: 600px;
            border-radius:10px;
        }
        /* slot not part of shadow dom so light dom css works */
        slot[name="first"] {
            color:red;
            font-weight:bold;
            font-size:60px;
        }
        slot[name="title"] {
            color:green;
            font-weight:bold;
            font-style: italic;
            font-size:30px;
        }
    </style>
    <div class="card">
        <slot name="first"></slot><br>
        <slot name="title" "></slot><br>
        <slot name="email" "></slot>
    </div>
    <slot>Default slot text</slot>
`;

    }
}

customElements.define('my-card',
    useCycleMixin(BusinessCard, { propNames: [] })
  );
  