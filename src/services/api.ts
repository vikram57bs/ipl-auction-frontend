const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
    team?: {
      id: number;
      name: string;
    };
  };
}

export interface Player {
  id: number;
  name: string;
  age: number;
  role: string;
  matches: number;
  runs: number;
  fifties: number;
  hundreds: number;
  strikeRate: number;
  wickets: number;
  economy: number;
  basePrice: number;
  status: string;
  soldPrice?: number;
  soldToTeamId?: number;
  soldToTeam?: Team;
}

export interface Team {
  id: number;
  name: string;
  initialBudget: number;
  remainingBudget: number;
  spent?: number;
  playersCount?: number;
}

export interface Transaction {
  id: number;
  playerId: number;
  player: Player;
  teamId: number;
  team: Team;
  amount: number;
  createdAt: string;
}

export interface AuctionState {
  currentPlayer?: Player;
  teamSummaries: Team[];
  recentTransactions: Transaction[];
  highestBuys: Player[];
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  async getUnsoldPlayers(search?: string, role?: string): Promise<Player[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role && role !== 'all') params.append('role', role);

    const response = await fetch(
      `${API_BASE_URL}/players/unsold?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );

    if (!response.ok) throw new Error('Failed to fetch players');
    return response.json();
  },

  async setCurrentPlayer(playerId: number): Promise<Player> {
    const response = await fetch(`${API_BASE_URL}/auction/current`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ playerId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to set current player');
    }

    return response.json();
  },

  async sellPlayer(teamId: number, amount: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auction/sell`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ teamId, amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sell player');
    }

    return response.json();
  },

  async getAuctionState(): Promise<AuctionState> {
    const response = await fetch(`${API_BASE_URL}/auction/state`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) throw new Error('Failed to fetch auction state');
    return response.json();
  },

  async getTeamsSummary(): Promise<Team[]> {
    const response = await fetch(`${API_BASE_URL}/teams/summary`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) throw new Error('Failed to fetch teams summary');
    return response.json();
  },

  async getTeamSquad(teamId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/squad`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) throw new Error('Failed to fetch team squad');
    return response.json();
  },

  async getTeamAnalytics(teamId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/analytics`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) throw new Error('Failed to fetch team analytics');
    return response.json();
  },
};
