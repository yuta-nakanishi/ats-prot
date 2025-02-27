import { Candidate, CandidateStatus } from '../../types';
import { apiRequest, API_BASE_URL } from './common';

/**
 * 候補者一覧を取得する
 * @param companyId 会社ID（指定した場合は会社に紐づく候補者のみ取得）
 * @param status ステータスでフィルター（オプション）
 * @returns 候補者一覧
 */
export const getCandidates = async (companyId?: string, status?: CandidateStatus): Promise<Candidate[]> => {
  const queryParams = new URLSearchParams();
  
  if (companyId) {
    queryParams.append('companyId', companyId);
  }
  
  if (status) {
    queryParams.append('status', status);
  }
  
  const endpoint = `/candidates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiRequest<Candidate[]>(endpoint, 'GET');
};

/**
 * 候補者詳細を取得する
 * @param id 候補者ID
 * @returns 候補者詳細情報
 */
export const getCandidateById = async (id: string): Promise<Candidate> => {
  return apiRequest<Candidate>(`/candidates/${id}`, 'GET');
};

/**
 * 新規候補者を登録する
 * @param candidateData 候補者データ
 * @param resumeFile 履歴書ファイル（オプション）
 * @returns 登録された候補者情報
 */
export const createCandidate = async (candidateData: Partial<Candidate>, resumeFile?: File): Promise<Candidate> => {
  if (!resumeFile) {
    // 通常のJSON送信
    return apiRequest<Candidate>('/candidates', 'POST', candidateData);
  } else {
    // マルチパートフォームデータでの送信
    const formData = new FormData();
    
    // 候補者データをJSONからFormDataに変換
    for (const key in candidateData) {
      if (key === 'urls' && candidateData.urls) {
        // URLsオブジェクトの各プロパティを分解して追加
        for (const urlKey in candidateData.urls) {
          const value = candidateData.urls[urlKey as keyof typeof candidateData.urls];
          if (value) {
            formData.append(`urls.${urlKey}`, value);
          }
        }
      } else if (key === 'skills' && Array.isArray(candidateData.skills)) {
        // スキル配列を文字列に変換
        formData.append(key, candidateData.skills.join(','));
      } else if (candidateData[key as keyof typeof candidateData] !== undefined) {
        formData.append(key, String(candidateData[key as keyof typeof candidateData]));
      }
    }
    
    // 履歴書ファイルを追加
    formData.append('file', resumeFile);
    
    // フェッチリクエスト
    const url = `${API_BASE_URL}/candidates`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '候補者の登録に失敗しました');
    }
    
    return response.json();
  }
};

/**
 * 候補者情報を更新する
 * @param id 候補者ID
 * @param candidateData 更新する候補者データ
 * @param resumeFile 新しい履歴書ファイル（オプション）
 * @returns 更新された候補者情報
 */
export const updateCandidate = async (
  id: string, 
  candidateData: Partial<Candidate>, 
  resumeFile?: File
): Promise<Candidate> => {
  if (!resumeFile) {
    // 通常のJSON送信
    return apiRequest<Candidate>(`/candidates/${id}`, 'PUT', candidateData);
  } else {
    // マルチパートフォームデータでの送信
    const formData = new FormData();
    
    // 候補者データをJSONからFormDataに変換
    for (const key in candidateData) {
      if (key === 'urls' && candidateData.urls) {
        // URLsオブジェクトの各プロパティを分解して追加
        for (const urlKey in candidateData.urls) {
          const value = candidateData.urls[urlKey as keyof typeof candidateData.urls];
          if (value) {
            formData.append(`urls.${urlKey}`, value);
          }
        }
      } else if (key === 'skills' && Array.isArray(candidateData.skills)) {
        // スキル配列を文字列に変換
        formData.append(key, candidateData.skills.join(','));
      } else if (candidateData[key as keyof typeof candidateData] !== undefined) {
        formData.append(key, String(candidateData[key as keyof typeof candidateData]));
      }
    }
    
    // 履歴書ファイルを追加
    formData.append('file', resumeFile);
    
    // フェッチリクエスト
    const url = `${API_BASE_URL}/candidates/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '候補者情報の更新に失敗しました');
    }
    
    return response.json();
  }
};

/**
 * 候補者のステータスを更新する
 * @param id 候補者ID
 * @param status 新しいステータス
 * @returns 更新された候補者情報
 */
export const updateCandidateStatus = async (id: string, status: CandidateStatus): Promise<Candidate> => {
  return apiRequest<Candidate>(`/candidates/${id}/status`, 'PUT', { status });
};

/**
 * 候補者を削除する
 * @param id 候補者ID
 * @returns 成功した場合はtrue
 */
export const deleteCandidate = async (id: string): Promise<boolean> => {
  await apiRequest(`/candidates/${id}`, 'DELETE');
  return true;
};

/**
 * 履歴書ファイルのダウンロードURLを取得する
 * @param id 候補者ID
 * @returns ダウンロードURL
 */
export const getCandidateResumeUrl = (id: string): string => {
  return `${API_BASE_URL}/candidates/${id}/resume`;
}; 