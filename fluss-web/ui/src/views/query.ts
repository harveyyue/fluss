import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../services/api.ts';

@customElement('query-view')
export class QueryView extends LitElement {
  connectedCallback() {
    super.connectedCallback();
    console.log('QueryView mounted');
  }
  static styles = css`
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
  `;

  @state()
  private query = 'SELECT * FROM ';
  @state()
  private results: any[] = [];
  @state()
  private columns: string[] = [];
  @state()
  private loading = false;
  @state()
  private error = '';
  @state()
  private successMessage = '';

  async executeQuery() {
    if (!this.query.trim()) return;
    this.loading = true;
    this.error = '';
    this.successMessage = '';
    this.results = [];
    this.columns = [];

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: this.query }),
      });

      const data = await response.json();

      if (data.error) {
        this.error = data.error;
      } else {
        this.columns = data.columns || [];
        this.results = data.results || [];
        if (this.results.length === 0) {
          this.successMessage = 'Query executed successfully. No results returned.';
        }
      }
    } catch (e: any) {
      this.error = e.message || 'Failed to execute query';
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  render() {
    return html`
      <div class="card">
        <div class="title">SQL Query</div>
        <textarea
          class="query-input"
          .value=${this.query}
          @input=${(e: any) => (this.query = e.target.value)}
          placeholder="Enter SQL query..."
        ></textarea>
        <button
          class="btn btn-primary"
          @click=${this.executeQuery}
          ?disabled=${this.loading}
        >
          ${this.loading ? 'Executing...' : 'Execute'}
        </button>

        ${this.error ? html`<div class="error">${this.error}</div>` : ''}
        ${this.successMessage ? html`<div class="success">${this.successMessage}</div>` : ''}

        ${this.results.length > 0
          ? html`
              <div class="results">
                <div class="row-count">${this.results.length} rows</div>
                <table class="result-table">
                  <thead>
                    <tr>
                      ${this.columns.map((col) => html`<th>${col}</th>`)}
                    </tr>
                  </thead>
                  <tbody>
                    ${this.results.map(
                      (row) => html`
                        <tr>
                          ${this.columns.map((col) => html`<td>${row[col] ?? ''}</td>`)}
                        </tr>
                      `
                    )}
                  </tbody>
                </table>
              </div>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'query-view': QueryView;
  }
}
