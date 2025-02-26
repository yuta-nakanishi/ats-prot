/**
 * 日付文字列をフォーマットする
 * @param dateString 日付文字列
 * @returns フォーマットされた日付文字列
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '無効な日付';
    }
    
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '無効な日付';
  }
}

/**
 * 数値を通貨形式でフォーマットする
 * @param value 数値
 * @returns フォーマットされた通貨文字列
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0
  }).format(value);
} 