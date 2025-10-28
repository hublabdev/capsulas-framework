import type { RouteParams, QueryParams } from './types';

export function matchPath(pattern: string, path: string): RouteParams | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    // Check for optional parameters
    const hasOptional = pattern.includes('?');
    if (!hasOptional) return null;
  }

  const params: RouteParams = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(':')) {
      const paramName = patternPart.slice(1).replace('?', '');
      params[paramName] = pathPart || '';
    } else if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}

export function parseQuery(queryString: string): QueryParams {
  const params: QueryParams = {};
  const search = queryString.startsWith('?') ? queryString.slice(1) : queryString;

  if (!search) return params;

  const pairs = search.split('&');

  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    const decodedKey = decodeURIComponent(key);
    const decodedValue = decodeURIComponent(value || '');

    if (params[decodedKey]) {
      const existing = params[decodedKey];
      params[decodedKey] = Array.isArray(existing)
        ? [...existing, decodedValue]
        : [existing as string, decodedValue];
    } else {
      params[decodedKey] = decodedValue;
    }
  }

  return params;
}

export function buildPath(path: string, params: RouteParams): string {
  let result = path;

  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, value);
  }

  return result;
}
