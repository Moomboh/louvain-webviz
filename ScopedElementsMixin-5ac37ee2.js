import{i as e}from"./query-assigned-elements-fc22e6ee.js";const t=new WeakMap;const s=!!ShadowRoot.prototype.createElement,o=(r=t=>class extends t{static get scopedElements(){return{}}static get shadowRootOptions(){return this.__shadowRootOptions}static set shadowRootOptions(e){this.__shadowRootOptions=e}static get elementStyles(){return this.__elementStyles}static set elementStyles(e){this.__elementStyles=e}constructor(...e){super(),this.renderOptions=this.renderOptions||void 0}get registry(){return this.constructor.__registry}set registry(e){this.constructor.__registry=e}createRenderRoot(){const{scopedElements:t,shadowRootOptions:o,elementStyles:r}=this.constructor;if(!this.registry){this.registry=s?new CustomElementRegistry:customElements;for(const[e,s]of Object.entries(t))this.defineScopedElement(e,s)}const n={mode:"open",...o,customElements:this.registry},i=this.attachShadow(n);return s&&(this.renderOptions.creationScope=i),i instanceof ShadowRoot&&(e(i,r),this.renderOptions.renderBefore=this.renderOptions.renderBefore||i.firstChild),i}createScopedElement(e){return(s?this.shadowRoot:document).createElement(e)}defineScopedElement(e,t){const o=this.registry.get(e);return o&&!1===s&&o!==t&&console.error([`You are trying to re-register the "${e}" custom element with a different class via ScopedElementsMixin.`,"This is only possible with a CustomElementRegistry.","Your browser does not support this feature so you will need to load a polyfill for it.",'Load "@webcomponents/scoped-custom-element-registry" before you register ANY web component to the global customElements registry.','e.g. add "<script src="/node_modules/@webcomponents/scoped-custom-element-registry/scoped-custom-element-registry.min.js"><\/script>" as your first script tag.',"For more details you can visit https://open-wc.org/docs/development/scoped-elements/"].join("\n")),o?this.registry.get(e):this.registry.define(e,t)}getScopedTagName(e){return e}static getScopedTagName(e){return e}},e=>{if(function(e,s){let o=s;for(;o;){if(t.get(o)===e)return!0;o=Object.getPrototypeOf(o)}return!1}(r,e))return e;const s=r(e);return t.set(s,r),s});var r;export{o as S};
