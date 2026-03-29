var xe=Object.defineProperty;var Ae=(r,e,t)=>e in r?xe(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var f=(r,e,t)=>Ae(r,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function t(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=t(s);fetch(s.href,o)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const L=globalThis,K=L.ShadowRoot&&(L.ShadyCSS===void 0||L.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Z=Symbol(),te=new WeakMap;let ue=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==Z)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(K&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=te.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&te.set(t,e))}return e}toString(){return this.cssText}};const we=r=>new ue(typeof r=="string"?r:r+"",void 0,Z),G=(r,...e)=>{const t=r.length===1?r[0]:e.reduce((i,s,o)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+r[o+1],r[0]);return new ue(t,r,Z)},Ee=(r,e)=>{if(K)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),s=L.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,r.appendChild(i)}},se=K?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return we(t)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Se,defineProperty:Pe,getOwnPropertyDescriptor:Ce,getOwnPropertyNames:Oe,getOwnPropertySymbols:Te,getPrototypeOf:Ue}=Object,v=globalThis,ie=v.trustedTypes,Me=ie?ie.emptyScript:"",B=v.reactiveElementPolyfillSupport,N=(r,e)=>r,j={toAttribute(r,e){switch(e){case Boolean:r=r?Me:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},X=(r,e)=>!Se(r,e),re={attribute:!0,type:String,converter:j,reflect:!1,useDefault:!1,hasChanged:X};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),v.litPropertyMetadata??(v.litPropertyMetadata=new WeakMap);let O=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=re){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);s!==void 0&&Pe(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:o}=Ce(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:s,set(n){const l=s==null?void 0:s.call(this);o==null||o.call(this,n),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??re}static _$Ei(){if(this.hasOwnProperty(N("elementProperties")))return;const e=Ue(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(N("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(N("properties"))){const t=this.properties,i=[...Oe(t),...Te(t)];for(const s of i)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,s]of t)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const s=this._$Eu(t,i);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)t.unshift(se(s))}else e!==void 0&&t.push(se(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(t=>t(this))}addController(e){var t;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((t=e.hostConnected)==null||t.call(e))}removeController(e){var t;(t=this._$EO)==null||t.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ee(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(t=>{var i;return(i=t.hostConnected)==null?void 0:i.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(t=>{var i;return(i=t.hostDisconnected)==null?void 0:i.call(t)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){var o;const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){const n=(((o=i.converter)==null?void 0:o.toAttribute)!==void 0?i.converter:j).toAttribute(t,i.type);this._$Em=e,n==null?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(e,t){var o,n;const i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const l=i.getPropertyOptions(s),a=typeof l.converter=="function"?{fromAttribute:l.converter}:((o=l.converter)==null?void 0:o.fromAttribute)!==void 0?l.converter:j;this._$Em=s;const h=a.fromAttribute(t,l.type);this[s]=h??((n=this._$Ej)==null?void 0:n.get(s))??h,this._$Em=null}}requestUpdate(e,t,i,s=!1,o){var n;if(e!==void 0){const l=this.constructor;if(s===!1&&(o=this[e]),i??(i=l.getPropertyOptions(e)),!((i.hasChanged??X)(o,t)||i.useDefault&&i.reflect&&o===((n=this._$Ej)==null?void 0:n.get(e))&&!this.hasAttribute(l._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:o},n){i&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,n??t??this[e]),o!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var i;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[o,n]of this._$Ep)this[o]=n;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[o,n]of s){const{wrapped:l}=n,a=this[o];l!==!0||this._$AL.has(o)||a===void 0||this.C(o,void 0,n,a)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),(i=this._$EO)==null||i.forEach(s=>{var o;return(o=s.hostUpdate)==null?void 0:o.call(s)}),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){var t;(t=this._$EO)==null||t.forEach(i=>{var s;return(s=i.hostUpdated)==null?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};O.elementStyles=[],O.shadowRootOptions={mode:"open"},O[N("elementProperties")]=new Map,O[N("finalized")]=new Map,B==null||B({ReactiveElement:O}),(v.reactiveElementVersions??(v.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const D=globalThis,oe=r=>r,V=D.trustedTypes,ne=V?V.createPolicy("lit-html",{createHTML:r=>r}):void 0,fe="$lit$",_=`lit$${Math.random().toFixed(9).slice(2)}$`,$e="?"+_,Ne=`<${$e}>`,S=document,H=()=>S.createComment(""),R=r=>r===null||typeof r!="object"&&typeof r!="function",Y=Array.isArray,De=r=>Y(r)||typeof(r==null?void 0:r[Symbol.iterator])=="function",Q=`[ 	
\f\r]`,M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ae=/-->/g,le=/>/g,x=RegExp(`>|${Q}(?:([^\\s"'>=/]+)(${Q}*=${Q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ce=/'/g,he=/"/g,be=/^(?:script|style|textarea|title)$/i,He=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),d=He(1),T=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),de=new WeakMap,A=S.createTreeWalker(S,129);function ge(r,e){if(!Y(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return ne!==void 0?ne.createHTML(e):e}const Re=(r,e)=>{const t=r.length-1,i=[];let s,o=e===2?"<svg>":e===3?"<math>":"",n=M;for(let l=0;l<t;l++){const a=r[l];let h,u,c=-1,b=0;for(;b<a.length&&(n.lastIndex=b,u=n.exec(a),u!==null);)b=n.lastIndex,n===M?u[1]==="!--"?n=ae:u[1]!==void 0?n=le:u[2]!==void 0?(be.test(u[2])&&(s=RegExp("</"+u[2],"g")),n=x):u[3]!==void 0&&(n=x):n===x?u[0]===">"?(n=s??M,c=-1):u[1]===void 0?c=-2:(c=n.lastIndex-u[2].length,h=u[1],n=u[3]===void 0?x:u[3]==='"'?he:ce):n===he||n===ce?n=x:n===ae||n===le?n=M:(n=x,s=void 0);const y=n===x&&r[l+1].startsWith("/>")?" ":"";o+=n===M?a+Ne:c>=0?(i.push(h),a.slice(0,c)+fe+a.slice(c)+_+y):a+_+(c===-2?l:y)}return[ge(r,o+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class q{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let o=0,n=0;const l=e.length-1,a=this.parts,[h,u]=Re(e,t);if(this.el=q.createElement(h,i),A.currentNode=this.el.content,t===2||t===3){const c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(s=A.nextNode())!==null&&a.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(const c of s.getAttributeNames())if(c.endsWith(fe)){const b=u[n++],y=s.getAttribute(c).split(_),z=/([.?@])?(.*)/.exec(b);a.push({type:1,index:o,name:z[2],strings:y,ctor:z[1]==="."?ke:z[1]==="?"?ze:z[1]==="@"?Le:F}),s.removeAttribute(c)}else c.startsWith(_)&&(a.push({type:6,index:o}),s.removeAttribute(c));if(be.test(s.tagName)){const c=s.textContent.split(_),b=c.length-1;if(b>0){s.textContent=V?V.emptyScript:"";for(let y=0;y<b;y++)s.append(c[y],H()),A.nextNode(),a.push({type:2,index:++o});s.append(c[b],H())}}}else if(s.nodeType===8)if(s.data===$e)a.push({type:2,index:o});else{let c=-1;for(;(c=s.data.indexOf(_,c+1))!==-1;)a.push({type:7,index:o}),c+=_.length-1}o++}}static createElement(e,t){const i=S.createElement("template");return i.innerHTML=e,i}}function U(r,e,t=r,i){var n,l;if(e===T)return e;let s=i!==void 0?(n=t._$Co)==null?void 0:n[i]:t._$Cl;const o=R(e)?void 0:e._$litDirective$;return(s==null?void 0:s.constructor)!==o&&((l=s==null?void 0:s._$AO)==null||l.call(s,!1),o===void 0?s=void 0:(s=new o(r),s._$AT(r,t,i)),i!==void 0?(t._$Co??(t._$Co=[]))[i]=s:t._$Cl=s),s!==void 0&&(e=U(r,s._$AS(r,e.values),s,i)),e}class qe{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=((e==null?void 0:e.creationScope)??S).importNode(t,!0);A.currentNode=s;let o=A.nextNode(),n=0,l=0,a=i[0];for(;a!==void 0;){if(n===a.index){let h;a.type===2?h=new k(o,o.nextSibling,this,e):a.type===1?h=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(h=new je(o,this,e)),this._$AV.push(h),a=i[++l]}n!==(a==null?void 0:a.index)&&(o=A.nextNode(),n++)}return A.currentNode=S,s}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class k{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=(s==null?void 0:s.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=U(this,e,t),R(e)?e===p||e==null||e===""?(this._$AH!==p&&this._$AR(),this._$AH=p):e!==this._$AH&&e!==T&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):De(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==p&&R(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){var o;const{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=q.createElement(ge(i.h,i.h[0]),this.options)),i);if(((o=this._$AH)==null?void 0:o._$AD)===s)this._$AH.p(t);else{const n=new qe(s,this),l=n.u(this.options);n.p(t),this.T(l),this._$AH=n}}_$AC(e){let t=de.get(e.strings);return t===void 0&&de.set(e.strings,t=new q(e)),t}k(e){Y(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const o of e)s===t.length?t.push(i=new k(this.O(H()),this.O(H()),this,this.options)):i=t[s],i._$AI(o),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var i;for((i=this._$AP)==null?void 0:i.call(this,!1,!0,t);e!==this._$AB;){const s=oe(e).nextSibling;oe(e).remove(),e=s}}setConnected(e){var t;this._$AM===void 0&&(this._$Cv=e,(t=this._$AP)==null||t.call(this,e))}}class F{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,o){this.type=1,this._$AH=p,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=p}_$AI(e,t=this,i,s){const o=this.strings;let n=!1;if(o===void 0)e=U(this,e,t,0),n=!R(e)||e!==this._$AH&&e!==T,n&&(this._$AH=e);else{const l=e;let a,h;for(e=o[0],a=0;a<o.length-1;a++)h=U(this,l[i+a],t,a),h===T&&(h=this._$AH[a]),n||(n=!R(h)||h!==this._$AH[a]),h===p?e=p:e!==p&&(e+=(h??"")+o[a+1]),this._$AH[a]=h}n&&!s&&this.j(e)}j(e){e===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ke extends F{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===p?void 0:e}}class ze extends F{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==p)}}class Le extends F{constructor(e,t,i,s,o){super(e,t,i,s,o),this.type=5}_$AI(e,t=this){if((e=U(this,e,t,0)??p)===T)return;const i=this._$AH,s=e===p&&i!==p||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==p&&(i===p||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t;typeof this._$AH=="function"?this._$AH.call(((t=this.options)==null?void 0:t.host)??this.element,e):this._$AH.handleEvent(e)}}class je{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){U(this,e)}}const W=D.litHtmlPolyfillSupport;W==null||W(q,k),(D.litHtmlVersions??(D.litHtmlVersions=[])).push("3.3.2");const Ve=(r,e,t)=>{const i=(t==null?void 0:t.renderBefore)??e;let s=i._$litPart$;if(s===void 0){const o=(t==null?void 0:t.renderBefore)??null;i._$litPart$=s=new k(e.insertBefore(H(),o),o,void 0,t??{})}return s._$AI(r),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const w=globalThis;class E extends O{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ve(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return T}}var pe;E._$litElement$=!0,E.finalized=!0,(pe=w.litElementHydrateSupport)==null||pe.call(w,{LitElement:E});const J=w.litElementPolyfillSupport;J==null||J({LitElement:E});(w.litElementVersions??(w.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ee=r=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(r,e)}):customElements.define(r,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ie={attribute:!0,type:String,converter:j,reflect:!1,hasChanged:X},Fe=(r=Ie,e,t)=>{const{kind:i,metadata:s}=t;let o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),i==="setter"&&((r=Object.create(r)).wrapped=!0),o.set(t.name,r),i==="accessor"){const{name:n}=t;return{set(l){const a=e.get.call(this);e.set.call(this,l),this.requestUpdate(n,a,r,!0,l)},init(l){return l!==void 0&&this.C(n,void 0,r,l),l}}}if(i==="setter"){const{name:n}=t;return function(l){const a=this[n];e.call(this,l),this.requestUpdate(n,a,r,!0,l)}}throw Error("Unsupported decorator location: "+i)};function Be(r){return(e,t)=>typeof t=="object"?Fe(r,e,t):((i,s,o)=>{const n=s.hasOwnProperty(o);return s.constructor.createProperty(o,i),n?Object.getOwnPropertyDescriptor(s,o):void 0})(r,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function $(r){return Be({...r,state:!0,attribute:!1})}var me=Object.defineProperty,Qe=Object.getOwnPropertyDescriptor,We=(r,e,t)=>e in r?me(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,P=(r,e,t,i)=>{for(var s=i>1?void 0:i?Qe(e,t):e,o=r.length-1,n;o>=0;o--)(n=r[o])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&me(e,t,s),s},Je=(r,e,t)=>We(r,e+"",t);let g=class extends E{constructor(){super(...arguments);f(this,"databases",[]);f(this,"currentDb","");f(this,"tables",[]);f(this,"selectedTable",null);f(this,"loading",!1);f(this,"error","")}async connectedCallback(){super.connectedCallback(),await this.loadDatabases()}async loadDatabases(){console.log("loadDatabases called");try{const e=await fetch("/api/databases");console.log("response:",e);const t=await e.json();console.log("data:",t),this.databases=t.databases||[],console.log("databases:",this.databases),this.databases.length>0&&(this.currentDb=this.databases[0],await this.loadTables()),this.requestUpdate()}catch(e){console.error("loadDatabases error:",e),this.error="Failed to load databases"}}async loadTables(){if(this.currentDb){this.loading=!0,this.error="";try{const t=await(await fetch(`/api/tables?database=${encodeURIComponent(this.currentDb)}`)).json();this.tables=t.tables||[],this.requestUpdate()}catch{this.error="Failed to load tables"}finally{this.loading=!1}}}async showTableSchema(e){try{const i=await(await fetch(`/api/table-schema?database=${encodeURIComponent(this.currentDb)}&table=${encodeURIComponent(e)}`)).json();this.selectedTable={name:e,schema:i},this.requestUpdate()}catch{this.error="Failed to load table schema"}}closeSchema(){this.selectedTable=null,this.requestUpdate()}render(){return this.selectedTable?d`
        <div class="card">
          <button class="close-btn" @click=${this.closeSchema}>Close</button>
          <div class="title">Table: ${this.selectedTable.name}</div>
          <table class="schema-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              ${(this.selectedTable.schema.columns||[]).map(e=>d`
                  <tr>
                    <td>${e.name}</td>
                    <td>${e.type}</td>
                    <td>${e.comment||""}</td>
                  </tr>
                `)}
            </tbody>
          </table>
        </div>
      `:d`
      <div class="card">
        <div class="title">Tables</div>
        ${this.databases.length>0?d`
              <select
                class="db-select"
                @change=${e=>{this.currentDb=e.target.value,this.loadTables()}}
              >
                ${this.databases.map(e=>d`<option value=${e} ?selected=${e===this.currentDb}>${e}</option>`)}
              </select>
            `:d`<div class="empty">No databases found</div>`}

        ${this.error?d`<div class="error">${this.error}</div>`:""}

        ${this.loading?d`<div class="loading">Loading...</div>`:""}

        ${!this.loading&&this.tables.length===0&&!this.error?d`<div class="empty">No tables in this database</div>`:""}

        <div class="table-list">
          ${this.tables.map(e=>d`
              <div class="table-item" @click=${()=>this.showTableSchema(e.name)}>
                <span class="table-name">${e.name}</span>
                <span class="table-type">${e.type}</span>
              </div>
            `)}
        </div>
      </div>
    `}};Je(g,"styles",G`
    :host {
      display: block;
    }
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #1a1a2e;
    }
    .db-select {
      width: 200px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .table-list {
      display: grid;
      gap: 8px;
    }
    .table-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .table-item:hover {
      background: #e9ecef;
    }
    .table-name {
      font-weight: 500;
    }
    .table-type {
      font-size: 12px;
      color: #666;
      background: #dee2e6;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .loading {
      color: #666;
      text-align: center;
      padding: 20px;
    }
    .error {
      color: #dc3545;
      padding: 12px;
      background: #f8d7da;
      border-radius: 6px;
    }
    .empty {
      color: #666;
      text-align: center;
      padding: 40px;
    }
    .schema-table {
      width: 100%;
      border-collapse: collapse;
    }
    .schema-table th,
    .schema-table td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .schema-table th {
      background: #f8f9fa;
      font-weight: 600;
    }
    .close-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
    }
  `);P([$()],g.prototype,"databases",2);P([$()],g.prototype,"currentDb",2);P([$()],g.prototype,"tables",2);P([$()],g.prototype,"selectedTable",2);P([$()],g.prototype,"loading",2);P([$()],g.prototype,"error",2);g=P([ee("tables-view")],g);var ye=Object.defineProperty,Ke=Object.getOwnPropertyDescriptor,Ze=(r,e,t)=>e in r?ye(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,C=(r,e,t,i)=>{for(var s=i>1?void 0:i?Ke(e,t):e,o=r.length-1,n;o>=0;o--)(n=r[o])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&ye(e,t,s),s},Ge=(r,e,t)=>Ze(r,e+"",t);let m=class extends E{constructor(){super(...arguments);f(this,"query","SELECT * FROM ");f(this,"results",[]);f(this,"columns",[]);f(this,"loading",!1);f(this,"error","");f(this,"successMessage","")}connectedCallback(){super.connectedCallback(),console.log("QueryView mounted")}async executeQuery(){if(this.query.trim()){this.loading=!0,this.error="",this.successMessage="",this.results=[],this.columns=[];try{const t=await(await fetch("/api/query",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sql:this.query})})).json();t.error?this.error=t.error:(this.columns=t.columns||[],this.results=t.results||[],this.results.length===0&&(this.successMessage="Query executed successfully. No results returned."))}catch(e){this.error=e.message||"Failed to execute query"}finally{this.loading=!1,this.requestUpdate()}}}render(){return d`
      <div class="card">
        <div class="title">SQL Query</div>
        <textarea
          class="query-input"
          .value=${this.query}
          @input=${e=>this.query=e.target.value}
          placeholder="Enter SQL query..."
        ></textarea>
        <button
          class="btn btn-primary"
          @click=${this.executeQuery}
          ?disabled=${this.loading}
        >
          ${this.loading?"Executing...":"Execute"}
        </button>

        ${this.error?d`<div class="error">${this.error}</div>`:""}
        ${this.successMessage?d`<div class="success">${this.successMessage}</div>`:""}

        ${this.results.length>0?d`
              <div class="results">
                <div class="row-count">${this.results.length} rows</div>
                <table class="result-table">
                  <thead>
                    <tr>
                      ${this.columns.map(e=>d`<th>${e}</th>`)}
                    </tr>
                  </thead>
                  <tbody>
                    ${this.results.map(e=>d`
                        <tr>
                          ${this.columns.map(t=>d`<td>${e[t]??""}</td>`)}
                        </tr>
                      `)}
                  </tbody>
                </table>
              </div>
            `:""}
      </div>
    `}};Ge(m,"styles",G`
    :host {
      display: block;
    }
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #1a1a2e;
    }
    .query-input {
      width: 100%;
      min-height: 150px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 14px;
      resize: vertical;
      margin-bottom: 12px;
    }
    .query-input:focus {
      outline: none;
      border-color: #1a1a2e;
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-primary {
      background: #1a1a2e;
      color: white;
    }
    .btn-primary:hover {
      opacity: 0.9;
    }
    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .results {
      margin-top: 16px;
    }
    .result-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }
    .result-table th,
    .result-table td {
      padding: 10px 12px;
      text-align: left;
      border: 1px solid #eee;
    }
    .result-table th {
      background: #f8f9fa;
      font-weight: 600;
    }
    .result-table tr:nth-child(even) {
      background: #fafafa;
    }
    .error {
      color: #dc3545;
      padding: 12px;
      background: #f8d7da;
      border-radius: 6px;
      margin-top: 12px;
    }
    .success {
      color: #155724;
      padding: 12px;
      background: #d4edda;
      border-radius: 6px;
      margin-top: 12px;
    }
    .loading {
      color: #666;
      margin-top: 12px;
    }
    .row-count {
      color: #666;
      font-size: 14px;
      margin-top: 8px;
    }
  `);C([$()],m.prototype,"query",2);C([$()],m.prototype,"results",2);C([$()],m.prototype,"columns",2);C([$()],m.prototype,"loading",2);C([$()],m.prototype,"error",2);C([$()],m.prototype,"successMessage",2);m=C([ee("query-view")],m);var _e=Object.defineProperty,Xe=Object.getOwnPropertyDescriptor,Ye=(r,e,t)=>e in r?_e(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,ve=(r,e,t,i)=>{for(var s=i>1?void 0:i?Xe(e,t):e,o=r.length-1,n;o>=0;o--)(n=r[o])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&_e(e,t,s),s},et=(r,e,t)=>Ye(r,e+"",t);let I=class extends E{constructor(){super(...arguments);f(this,"currentView","tables")}connectedCallback(){super.connectedCallback(),console.log("FlussApp mounted")}switchView(e){console.log("switchView:",e),this.currentView=e,this.requestUpdate()}render(){return d`
      <div class="header">
        <div class="logo">Fluss UI</div>
        <div class="nav">
          <div
            class="nav-item ${this.currentView==="tables"?"active":""}"
            @click=${()=>this.switchView("tables")}
          >
            Tables
          </div>
          <div
            class="nav-item ${this.currentView==="query"?"active":""}"
            @click=${()=>this.switchView("query")}
          >
            Query
          </div>
        </div>
      </div>
      <div class="main">
        ${this.currentView==="tables"?d`<tables-view></tables-view>`:d`<query-view></query-view>`}
      </div>
    `}};et(I,"styles",G`
    :host {
      display: block;
      min-height: 100vh;
    }
    .header {
      background: #1a1a2e;
      color: white;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .logo {
      font-size: 20px;
      font-weight: 600;
    }
    .nav {
      display: flex;
      gap: 8px;
    }
    .nav-item {
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .nav-item.active {
      background: #16213e;
    }
    .main {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
  `);ve([$()],I.prototype,"currentView",2);I=ve([ee("fluss-app")],I);
