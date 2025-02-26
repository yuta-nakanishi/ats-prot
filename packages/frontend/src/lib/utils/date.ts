/**
 * 日付文字列をフォーマットする関数
 * @param dateString ISO形式の日付文字列
 * @returns フォーマットされた日付文字列（例: 2024年4月1日 13:45）
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    // 無効な日付の場合は元の文字列を返す
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.error('日付フォーマットエラー:', error);
    return dateString;
  }
} 