export function formatDate(date: string): string {
  const value = date.length === 10 ? `${date}T00:00:00.000Z` : date
  return new Date(value).toLocaleDateString('ru-RU')
}
