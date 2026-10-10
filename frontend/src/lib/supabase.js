import { API_BASE } from './api';

const errorFrom = (body, status) => {
  if (!body?.error) return null;
  const error = new Error(body.error.message || `Request failed (${status})`);
  error.code = body.error.code;
  return error;
};

class DataQuery {
  constructor(table) {
    this.request = { table, action: 'select', columns: '*', values: null, filters: [], ordering: null, limit: null, single: false };
  }
  select(columns = '*') {
    this.request.columns = String(columns).trim().replace(/\s+/g, ' ');
    if (this.request.action !== 'select') this.request.returning = true;
    return this;
  }
  insert(values) { this.request.action = 'insert'; this.request.values = values; return this; }
  upsert(values, options = {}) { this.request.action = 'upsert'; this.request.values = values; this.request.on_conflict = options.onConflict; return this; }
  update(values) { this.request.action = 'update'; this.request.values = values; return this; }
  delete() { this.request.action = 'delete'; return this; }
  eq(field, value) { this.request.filters.push({ field, operator: 'eq', value }); return this; }
  gte(field, value) { this.request.filters.push({ field, operator: 'gte', value }); return this; }
  lte(field, value) { this.request.filters.push({ field, operator: 'lte', value }); return this; }
  gt(field, value) { this.request.filters.push({ field, operator: 'gt', value }); return this; }
  lt(field, value) { this.request.filters.push({ field, operator: 'lt', value }); return this; }
  not(field, operator, value) { this.request.filters.push({ field, operator: `not_${operator}`, value }); return this; }
  order(field, options = {}) { this.request.ordering = { field, ascending: options.ascending !== false }; return this; }
  limit(value) { this.request.limit = value; return this; }
  single() { this.request.single = true; return this; }
  maybeSingle() { this.request.single = true; return this; }
  then(resolve, reject) { return this.execute().then(resolve, reject); }
  async execute() {
    try {
      const response = await fetch(`${API_BASE}/api/data/query`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.request),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { data: null, error: new Error(body.detail || `Request failed (${response.status})`) };
      }
      return { data: body.data, error: errorFrom(body, response.status) };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Supabase remains the application's health-data store. All table access now
// passes through the authenticated backend; browser code has no Supabase key.
export const supabase = { from: (table) => new DataQuery(table) };

export const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
  if (!response.ok) return null;
  const body = await response.json().catch(() => null);
  return body?.user || null;
};
