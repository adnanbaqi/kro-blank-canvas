// API service for RhymeRivals backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types based on your API specification
export interface User {
  id: number;
  email: string;
  mc_name: string;
  hometown: string | null;
  is_active: boolean;
}

export interface UserStats {
  total_battles: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface BattlePreview {
  id: number;
  mc_a: string;
  mc_b: string;
  beat_url: string;
  ends_at: string;
  winner: string | null;
  submission_a_votes: number;
  submission_b_votes: number;
}

export interface Battle extends BattlePreview {
  status: 'active' | 'finished';
  has_voted?: boolean;
}

export interface BattleOut {
  id: number;
  beat_url: string;
  submission_a_url: string;
  submission_b_url: string;
  submission_a_votes: number;
  submission_b_votes: number;
  mc_a: string;
  mc_b: string;
  ends_at: string;
  status: string;
  winner_submission_id: number | null;
  has_voted: boolean;
}

export interface BattleDetail extends BattleOut {
  submission_a_id?: number;
  submission_b_id?: number;
}

export interface SubmissionOut {
  id: number;
  user_id: number;
  beat_id: number;
  file_url: string;
  created_at: string;
  votes: number;
}

export interface Submission extends SubmissionOut {}

export interface SubmissionStatus {
  submission_id: number;
  beat_url: string;
  paired: boolean;
  battle_id: number | null;
  opponent_mc: string | null;
  status: string;
  disqualified: boolean;
}

export interface BattleResult {
  battle_id: number;
  beat_url: string;
  opponent_mc: string;
  submission_votes: number;
  opponent_votes: number;
  winner_mc: string | null;
  status: string;
  ends_at: string;
}

export interface LeaderboardEntry {
  user_id: number;
  mc_name: string;
  profile_url: string;
  total_wins: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AdminAuditEntry {
  id: number;
  admin_id: number;
  admin_name: string;
  action: string;
  target_user_id?: number;
  target_user_name?: string;
  details?: string;
  created_at: string;
}

export interface AdminActionStats {
  total_actions: number;
  promotions: number;
  demotions: number;
  deletions: number;
}

export interface AdminUser {
  id: number;
  mc_name: string;
  email: string;
  is_admin: boolean;
}

export interface Beat {
  id: number;
  title: string;
  bpm: number;
  style: string;
  duration: string;
  file_url: string;
}

export interface BeatCreate {
  title: string;
  file_url: string;
}

export interface TournamentCategory {
  rap: string;
  beat: string;
  track: string;
}

// Custom error class to preserve response data
class ApiError extends Error {
  responseData: any;
  statusCode: number;

  constructor(message: string, responseData: any, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.responseData = responseData;
    this.statusCode = statusCode;
  }
}

class ApiService {
  private isGuest(): boolean {
    return localStorage.getItem('authToken') === 'guest';
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && token !== 'guest' && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: any;
      
      try {
        const errorText = await response.text();
        console.log('Error response text:', errorText); // Debug logging
        
        // Try to parse as JSON first to preserve the structured error
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // If not JSON, use the text as is
          errorData = { message: errorText };
        }
        
        // Create a custom error that preserves the structured error data
        const errorMessage = errorData.detail?.message || errorData.message || `HTTP error ${response.status}`;
        const error = new ApiError(errorMessage, errorData, response.status);
        
        throw error;
        
      } catch (parseError) {
        // If we can't parse the error, create a basic error
        const error = new ApiError(`HTTP error! status: ${response.status}`, {}, response.status);
        throw error;
      }
    }
    
    return response.json();
  }

  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<LoginResponse>(response);
  }

async register(userData: {
  email: string;
  password: string;
  mc_name: string;
  hometown?: string;
}): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  return this.handleResponse<LoginResponse>(response);
}

  // User endpoints
  async getCurrentUser(userId: number): Promise<User> {
    if (this.isGuest()) {
      throw new Error('Guests cannot access user profile. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/users/me?user_id=${userId}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<User>(response);
  }

  async getUserStats(userId: number): Promise<UserStats> {
    if (this.isGuest()) {
      return { total_battles: 0, wins: 0, losses: 0, draws: 0 };
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/users/me/stats?user_id=${userId}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<UserStats>(response);
  }

  // Battles
  async getActiveBattles(): Promise<BattlePreview[]> {
    if (this.isGuest()) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/battles/active`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<BattlePreview[]>(response);
  }

  async getFinishedBattles(): Promise<BattlePreview[]> {
    if (this.isGuest()) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/battles/finished`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<BattlePreview[]>(response);
  }

  async getMyBattles(): Promise<BattleResult[]> {
    if (this.isGuest()) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/battles/me`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<BattleResult[]>(response);
  }

  async getBattleDetails(battleId: number): Promise<BattleOut> {
    if (this.isGuest()) {
      throw new Error('Guests cannot view battle details. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/battles/${battleId}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<BattleOut>(response);
  }

  // Voting
  async vote(battleId: number, votedSubmissionId: number): Promise<string> {
    if (this.isGuest()) {
      throw new Error('Guests cannot vote. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/votes/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        battle_id: battleId,
        voted_submission_id: votedSubmissionId,
      }),
    });

    return this.handleResponse<string>(response);
  }

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (this.isGuest()) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/votes/leaderboard/wins`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<LeaderboardEntry[]>(response);
  }

  // Submissions
  async uploadSubmission(userId: number, data: {
    beat_id: number;
    file_url: string;
    tournament_id?: number | null;
  }): Promise<SubmissionOut> {
    if (this.isGuest()) {
      throw new Error('Guests cannot submit. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/submissions/?user_id=${userId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<SubmissionOut>(response);
  }

  async getMySubmissions(): Promise<SubmissionStatus[]> {
    if (this.isGuest()) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/submissions/me`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<SubmissionStatus[]>(response);
  }

  // Health check
  async getStatus(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/status`);
    return this.handleResponse<string>(response);
  }

  // Debug method to check authentication
  async checkAuth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/battles/active`, {
        headers: this.getAuthHeaders(),
      });
      
      if (response.status === 401) {
        console.error('Authentication failed - token is invalid');
        return false;
      }
      
      return response.ok;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }

  // Admin endpoints
  async removeSubmission(submissionId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/submission/${submissionId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<void>(response);
  }

  async promoteUserToAdmin(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/promote`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<void>(response);
  }

  async demoteAdminUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/demote`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<void>(response);
  }

  async getUserAuditHistory(userId: number): Promise<AdminAuditEntry[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/audit-history`, {
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<AdminAuditEntry[]>(response);
  }

  async getRecentAdminActions(limit: number = 50): Promise<AdminAuditEntry[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/audit/recent?limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<AdminAuditEntry[]>(response);
  }

  async getAdminActionStats(): Promise<AdminActionStats> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/stats/admin-actions`, {
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<AdminActionStats>(response);
  }

  async uploadBeatAdmin(data: { title: string; file_url: string }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/beats/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<void>(response);
  }

  async checkUserAdminStatus(userId: number): Promise<{ is_admin: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/admin-status`, {
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<{ is_admin: boolean }>(response);
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/admin-list`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<AdminUser[]>(response);
  }

  async getAvailableBeats(): Promise<Beat[]> {
    if (this.isGuest()) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/beats/`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Beat[]>(response);
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/password-reset/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async updateUserProfile(userId: number, data: { mc_name?: string; hometown?: string }): Promise<User> {
    if (this.isGuest()) {
      throw new Error('Guests cannot update profile. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<User>(response);
  }

  async createTournament(title: string, category: 'rap' | 'beat' | 'track'): Promise<any> {
    if (this.isGuest()) {
      throw new Error('Guests cannot create tournaments. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/tournaments/?title=${encodeURIComponent(title)}&category=${category}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async joinTournament(tournamentId: number, submissionId: number): Promise<any> {
    if (this.isGuest()) {
      throw new Error('Guests cannot join tournaments. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/tournaments/${tournamentId}/join?submission_id=${submissionId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async getTournamentBracket(tournamentId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/v1/tournaments/${tournamentId}/bracket`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<any>(response);
  }
}

export const apiService = new ApiService();