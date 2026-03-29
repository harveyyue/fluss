import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TableInfo, DatabaseInfo } from '../services/api.ts';

@customElement('tables-view')
export class TablesView extends LitElement {
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
  `;

  @state()
  private databases: string[] = [];

  @state()
  private currentDb: string = '';

  @state()
  private tables: TableInfo[] = [];

  @state()
  private selectedTable: { name: string; schema: any } | null = null;

  @state()
  private loading = false;

  @state()
  private error = '';

  async connectedCallback() {
    super.connectedCallback();
    await this.loadDatabases();
  }

  async loadDatabases() {
    console.log('loadDatabases called');
    try {
      const response = await fetch('/api/databases');
      console.log('response:', response);
      const data = await response.json();
      console.log('data:', data);
      this.databases = data.databases || [];
      console.log('databases:', this.databases);
      if (this.databases.length > 0) {
        this.currentDb = this.databases[0];
        await this.loadTables();
      }
      this.requestUpdate();
    } catch (e) {
      console.error('loadDatabases error:', e);
      this.error = 'Failed to load databases';
    }
  }

  async loadTables() {
    if (!this.currentDb) return;
    this.loading = true;
    this.error = '';
    try {
      const response = await fetch(`/api/tables?database=${encodeURIComponent(this.currentDb)}`);
      const data = await response.json();
      this.tables = data.tables || [];
      this.requestUpdate();
    } catch (e) {
      this.error = 'Failed to load tables';
    } finally {
      this.loading = false;
    }
  }

  async showTableSchema(tableName: string) {
    try {
      const response = await fetch(
        `/api/table-schema?database=${encodeURIComponent(this.currentDb)}&table=${encodeURIComponent(tableName)}`
      );
      const data = await response.json();
      this.selectedTable = { name: tableName, schema: data };
      this.requestUpdate();
    } catch (e) {
      this.error = 'Failed to load table schema';
    }
  }

  closeSchema() {
    this.selectedTable = null;
    this.requestUpdate();
  }

  render() {
    if (this.selectedTable) {
      return html`
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
              ${(this.selectedTable.schema.columns || []).map(
                (col: any) => html`
                  <tr>
                    <td>${col.name}</td>
                    <td>${col.type}</td>
                    <td>${col.comment || ''}</td>
                  </tr>
                `
              )}
            </tbody>
          </table>
        </div>
      `;
    }

    return html`
      <div class="card">
        <div class="title">Tables</div>
        ${this.databases.length > 0
          ? html`
              <select
                class="db-select"
                @change=${(e: any) => {
                  this.currentDb = e.target.value;
                  this.loadTables();
                }}
              >
                ${this.databases.map(
                  (db) => html`<option value=${db} ?selected=${db === this.currentDb}>${db}</option>`
                )}
              </select>
            `
          : html`<div class="empty">No databases found</div>`}

        ${this.error ? html`<div class="error">${this.error}</div>` : ''}

        ${this.loading ? html`<div class="loading">Loading...</div>` : ''}

        ${!this.loading && this.tables.length === 0 && !this.error
          ? html`<div class="empty">No tables in this database</div>`
          : ''}

        <div class="table-list">
          ${this.tables.map(
            (table) => html`
              <div class="table-item" @click=${() => this.showTableSchema(table.name)}>
                <span class="table-name">${table.name}</span>
                <span class="table-type">${table.type}</span>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tables-view': TablesView;
  }
}
