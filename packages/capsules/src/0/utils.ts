export function generateId(): string {
  return `0_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
