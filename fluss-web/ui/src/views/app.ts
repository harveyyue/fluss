import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './tables.ts';
import './query.ts';

@customElement('fluss-app')
export class FlussApp extends LitElement {
  connectedCallback() {
    super.connectedCallback();
    console.log('FlussApp mounted');
  }
  static styles = css`
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
  `;

  @state()
  private currentView: 'tables' | 'query' = 'tables';

  private switchView(view: 'tables' | 'query') {
    console.log('switchView:', view);
    this.currentView = view;
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="header">
        <div class="logo">Fluss UI</div>
        <div class="nav">
          <div
            class="nav-item ${this.currentView === 'tables' ? 'active' : ''}"
            @click=${() => this.switchView('tables')}
          >
            Tables
          </div>
          <div
            class="nav-item ${this.currentView === 'query' ? 'active' : ''}"
            @click=${() => this.switchView('query')}
          >
            Query
          </div>
        </div>
      </div>
      <div class="main">
        ${this.currentView === 'tables'
          ? html`<tables-view></tables-view>`
          : html`<query-view></query-view>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'fluss-app': FlussApp;
  }
}
