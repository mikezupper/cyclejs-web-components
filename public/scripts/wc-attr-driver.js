//import { adapt } from "@cycle/run/lib/adapt";
window.xs = xstream.default;

export function webComponentDriver(request$) {
  // Execute writing actions.
  request$.addListener({
    next: (request) => writeAttributeToWebComponent(request),
  });

  // Return reading functions.
  return responseCollection(request$);
}
function writeAttributeToWebComponent(request) {}

function responseCollection(request$) {
  return {
    get attributes() {
      return getResponseObj(request$);
    },
  };
}

const attributeProducer = {
  start: function (listener) {
    console.log("[WC DRIVER (attributeProducer)]");

    this.sendReq = function (attr) {
      console.log("[WC DRIVER (attributeProducer)] sendReq",attr);

      listener.next({
        target: "attributes",
        name: attr.name,
        value: attr.newValue,
      });
    };

    window.addEventListener("attributes", this.sendReq);
  },

  stop: function () {
    window.removeEventListener("attributes", this.sendReq);
  },
};

const attributeRequest$ = xs.create(attributeProducer);

function getAttribute$(request$) {
  console.log("[WC DRIVER (getAttributes$)] ",request$);

  return xs.merge(
    request$.filter((req) => !req.target || req.target === "attributes"),
    attributeRequest$
  );
}

function attributeName(name, request$) {
  const attributes$ = getAttribute$(request$);
  //TODO:  const key =localStorage.key(name) ;
  console.log("[WC DRIVER (attributeName)]",name,request$);

  return (
    attributes$
      //   .filter(req => req.key === key)
      //   .map(req => req.key)
      .startWith(name)
      .compose(dropRepeats())
  );
}

export default function getResponseObj(request$) {
  console.log("[WC DRIVER (getResponseOjb)]",request$);

  return {
    attribute(name) {
      return Cycle.adapt(attributeName(name, request$));
    },
  };
}
