const isolate = CycleIsolate.default;
1;
import { fromEvent } from "/scripts/fromEvent.js";
//assume xstream si on window object (TODO: how to load as ESM?)
window.xs = xstream.default;

export const useCycleMixin = (targetClass, options) => {
  console.log("[MIXIN] using Cycle.js with the following options: ", options);

  return class extends targetClass {
    static get observedAttributes() {
      return [...options?.propNames];
    }

    constructor() {
      super();
      this._cyclejsProps$ = xs.create();
      this._cyclejsProps = makePropsObject(options?.propNames);
      this.drivers = {
        ATTR: () => ({
          filter: function (attributeName) {
            console.log(
              "[MIXIN] - attr filter ",
              attributeName,
              this._cyclejsProps$
            );
            return fromEvent(document, "change").filter(
              (ev) => ev.target.attributeName === attributeName
            );
          },
          attributes: this._cyclejsProps$,
        }),
      };
      Cycle.run(this.main, this.drivers);
    }

    ///sources = READ EFFECTS
    main(sources) {
      const action$ = intent(sources);
      const state$ = model(action$);
      const { vtree$, rtree$ } = view(state$);

      //SINKS - what write effects????
      return {
        // DOM: vtree$,
        RDOM: rtree$,
        ATTR: sources.ATTR.attributes,
      };
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (super.attributeChangedCallback)
        super.attributeChangedCallback(name, oldValue, newValue);
      console.log(
        "[MIXIN] - attributeChangedCallback",
        name,
        oldValue,
        newValue,
        this._cyclejsProps[name]
      );
      this._cyclejsProps[name] = newValue;
      //THIS WILL SEND A PROP change into the view....
      this._cyclejsProps$.shamefullySendNext({ name, value: newValue });
      console.log(
        "[MIXIN] - attributeChangedCallback after",
        name,
        this._cyclejsProps[name]
      );
    }
    connectedCallback() {
      console.log("[MIXIN] - connectedCallback");
      if(super.connectedCallback)super.connectedCallback();
    }
    disconnectedCallback() {
      console.log("[MIXIN] disconnectedCallback");
    }
  };
};

function intent(sources) {
  const attrChanges$ = sources.ATTR.attributes;
  return { attrChanges$ };
}

function model(actions) {
  const { attrChanges$ } = actions;
  return xs.combine(attrChanges$).map(([attrChange]) => {
    console.log("[MIXIN] - model", attrChange);
    return { attrChange };
  });
}
function view(state$) {
  return {
    // vtree$: domView(state$),
    //rtree$: attrView(state$),
    rtree$: xs.of([]),
  };
}

function attrView(state$) {
  return state$.map((state) => {
    console.log("[MIXIN] - attr view - ", state);
  });
}

// function domView(state$) {
//   return state$.map((state) =>
//     div([
//       div([
//         label("Color attr: " + state.color.name),
//         select(".color", [
//           option(
//             {
//               attrs: {
//                 value: "red",
//               },
//             },
//             "red"
//           ),
//           option(
//             {
//               attrs: {
//                 value: "green",
//               },
//             },
//             "green"
//           ),
//         ]),
//       ]),
//       div([
//         label("Length attr: " + state.length.name),
//         select(".length", [
//           option(
//             {
//               attrs: {
//                 value: "10",
//               },
//             },
//             "10"
//           ),
//           option(
//             {
//               attrs: {
//                 value: "100",
//               },
//             },
//             "100"
//           ),
//         ]),
//       ]),
//       h2(
//         " ATTR CHANGE: " + state.attrChange.name + "=" + state.attrChange.value
//       ),
//       h2(" COLOR CHANGE: " + state.color.value),
//       h2(" LENGTH CHANGE: " + state.length.value),
//     ])
//   );
// }
function makePropsObject(attributes) {
  const result = {};
  for (let i = 0, N = attributes.length; i < N; i++) {
    const attribute = attributes[i];
    result[attribute.name] = attribute.value;
  }
  return result;
}
