const isolate = CycleIsolate.default;
import { useCycleMixin } from "/scripts/cycle-web-components.js";
class Square extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const div = document.createElement("div");
    const style = document.createElement("style");
    shadow.appendChild(style);
    shadow.appendChild(div);
  }

  connectedCallback() {
    console.log("[Square] - Custom square element added to page.");
    updateStyle(this);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log("[Square] - Custom square element attributes changed.");
    updateStyle(this);
  }
}

function updateStyle(elem) {
  const shadow = elem.shadowRoot;
  shadow.querySelector("style").textContent = `
    div {
      width: ${elem.getAttribute("l")}px;
      height: ${elem.getAttribute("l")}px;
      background-color: ${elem.getAttribute("c")};
    }
  `;
}
customElements.define(
  "custom-square",
  useCycleMixin(Square, { propNames: ["c", "l"] })
);
