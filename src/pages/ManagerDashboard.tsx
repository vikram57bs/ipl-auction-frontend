// src/pages/ManagerDashboard.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, Player, Team } from '../services/api';
import { initializeSocket } from '../services/socket';
import MainAuctionView from '../components/MainAuctionView';
import { Search, Filter, LogOut, TrendingUp, Users, DollarSign } from 'lucide-react';

/**
 * ManagerDashboard
 *
 * Fixes applied:
 * - Polls backend every POLL_INTERVAL ms (default 3000). Controlled by VITE_POLL_INTERVAL.
 * - Polling can be disabled by setting VITE_DISABLE_POLLING=true (useful for dev).
 * - Replaces state on each fetch (no appending) to avoid duplicate names.
 * - Normalizes strikeRate field so .toFixed won't crash and SR shows correctly.
 * - initializeSocket() guarded so it's only called once per client session.
 * - Polling is briefly suspended while write operations execute to avoid flicker.
 */

const POLL_INTERVAL = Number(import.meta.env.VITE_POLL_INTERVAL) || 3000;
const DISABLE_POLLING = String(import.meta.env.VITE_DISABLE_POLLING || 'false').toLowerCase() === 'true';

const ManagerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [unsoldPlayers, setUnsoldPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [auctionState, setAuctionState] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [soldAmount, setSoldAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // guard so we only initialize socket once (prevents duplicate listeners)
  const socketInitializedRef = useRef(false);

  // short-circuit polling during writes
  const suspendPollingRef = useRef(false);

  // helper: normalize player object to ensure strikeRate is number and id exists
  const normalizePlayer = useCallback((p: any): Player => {
    const strikeRateRaw = (p.strikeRate ?? p.SR ?? p.sr ?? p['SR'] ?? 0);
    const strikeRate = Number(strikeRateRaw) || 0;
    // Ensure numeric conversions for numeric fields too just in case
    return {
      ...p,
      id: String(p.id ?? p._id ?? p._id?.toString?.() ?? ''),
      name: String(p.name ?? ''),
      age: Number(p.age ?? 0),
      role: String(p.role ?? ''),
      matches: Number(p.matches ?? 0),
      runs: Number(p.runs ?? 0),
      fifties: Number(p.fifties ?? p['50s'] ?? 0),
      hundreds: Number(p.hundreds ?? p['100s'] ?? 0),
      strikeRate,
      wickets: Number(p.wickets ?? 0),
      economy: Number(p.economy ?? 0),
      basePrice: Number(p.basePrice ?? p.base_price ?? 0),
      status: p.status ?? 'unsold',
      soldPrice: p.soldPrice ?? p.sold_price ?? null,
      soldToTeamId: p.soldToTeamId ?? p.sold_to_team_id ?? null,
      soldToTeam: p.soldToTeam ?? null,
    } as Player;
  }, []);

  // load core dashboard data (auction state + teams)
  const loadData = useCallback(async () => {
    try {
      const [stateData, teamsData] = await Promise.all([
        api.getAuctionState(),
        api.getTeamsSummary(),
      ]);
      setAuctionState(stateData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  // load unsold players (replaces state, normalized)
  const loadUnsoldPlayers = useCallback(async () => {
    try {
      const playersRaw = await api.getUnsoldPlayers(search, roleFilter);
      const normalized = (playersRaw || []).map(normalizePlayer);

      // dedupe by id (just in case) and keep original order from server
      const seen = new Set<string>();
      const deduped: Player[] = [];
      for (const pl of normalized) {
        if (!pl.id) continue; // skip invalid entries
        if (!seen.has(pl.id)) {
          seen.add(pl.id);
          deduped.push(pl);
        }
      }

      setUnsoldPlayers(deduped);

      // small debug log: remove in production
      // eslint-disable-next-line no-console
      console.debug('Loaded unsold players:', deduped.length, deduped.slice(0, 5).map(p => `${p.name}:${p.strikeRate}`));
    } catch (error) {
      console.error('Error loading players:', error);
    }
  }, [search, roleFilter, normalizePlayer]);

  // initialize socket once and load initial data
  useEffect(() => {
    if (!socketInitializedRef.current) {
      try {
        initializeSocket();
      } catch (err) {
        console.warn('Socket initialize error (ignored):', err);
      }
      socketInitializedRef.current = true;
    }

    // initial load
    loadData();
    loadUnsoldPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // polling effect: polls unsold players + auction state periodically
  useEffect(() => {
    if (DISABLE_POLLING) {
      // Polling disabled via env var
      return;
    }

    let mounted = true;
    const interval = setInterval(async () => {
      if (!mounted) return;
      if (suspendPollingRef.current) {
        // skip one cycle if suspended
        suspendPollingRef.current = false;
        return;
      }
      try {
        // fetch both in parallel for efficiency
        const [playersRaw, stateData, teamsData] = await Promise.all([
          api.getUnsoldPlayers(search, roleFilter),
          api.getAuctionState(),
          api.getTeamsSummary(),
        ]);

        // only update if still mounted
        if (!mounted) return;

        // normalize players and set (replace)
        const normalized = (playersRaw || []).map(normalizePlayer);
        const seen = new Set<string>();
        const deduped: Player[] = [];
        for (const pl of normalized) {
          if (!pl.id) continue;
          if (!seen.has(pl.id)) {
            seen.add(pl.id);
            deduped.push(pl);
          }
        }
        setUnsoldPlayers(deduped);

        // set state & teams (replace)
        setAuctionState(stateData);
        setTeams(teamsData);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, POLL_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [search, roleFilter, normalizePlayer]);

  // re-run unsold players when search/roleFilter change immediately
  useEffect(() => {
    // immediate fetch on filter/search change
    loadUnsoldPlayers();
  }, [search, roleFilter, loadUnsoldPlayers]);

  // helper to suspend polling for one cycle (used around writes)
  const suspendPollingOnce = () => {
    suspendPollingRef.current = true;
  };

  const handlePutIntoAuction = async (playerId: number) => {
    setLoading(true);
    setMessage(null);
    try {
      suspendPollingOnce();
      await api.setCurrentPlayer(playerId);
      setMessage({ type: 'success', text: 'Player put into auction!' });

      // refresh immediately after write
      await loadData();
      await loadUnsoldPlayers();
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message ?? 'Failed to put player into auction' });
    } finally {
      setLoading(false);
    }
  };

  const handleSellPlayer = async () => {
    if (!selectedTeam || !soldAmount) {
      setMessage({ type: 'error', text: 'Please select a team and enter amount' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      suspendPollingOnce();
      await api.sellPlayer(selectedTeam, parseFloat(soldAmount));
      const soldTeam = teams.find(t => t.id === selectedTeam);
      setMessage({
        type: 'success',
        text: `Player sold to ${soldTeam?.name} for ₹${soldAmount} Cr!`,
      });
      setSelectedTeam(null);
      setSoldAmount('');

      // refresh immediately after write
      await loadData();
      await loadUnsoldPlayers();
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message ?? 'Failed to sell player' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalSold = auctionState?.teamSummaries?.reduce(
    (sum: number, team: any) => sum + (team.playersCount || 0),
    0
  ) || 0;

  const totalSpent = auctionState?.teamSummaries?.reduce(
    (sum: number, team: any) => sum + (team.spent || 0),
    0
  ) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <TrendingUp className="w-8 h-8 mr-3 text-yellow-400" />
              Manager Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Total Sold</p>
                <p className="text-white text-3xl font-bold">{totalSold}</p>
              </div>
              <Users className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">Total Spent</p>
                <p className="text-white text-3xl font-bold">₹{totalSpent.toFixed(1)} Cr</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Unsold</p>
                <p className="text-white text-3xl font-bold">{unsoldPlayers.length}</p>
              </div>
              <Filter className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-900/50 border border-green-700 text-green-200'
                : 'bg-red-900/50 border border-red-700 text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Unsold Players</h2>

              <div className="flex space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search players..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicket-Keeper">Wicket-Keeper</option>
                </select>
              </div>

              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Base Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Stats</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {unsoldPlayers.map((player) => (
                      <tr key={player.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3 text-white font-medium">{player.name}</td>
                        <td className="px-4 py-3 text-gray-300">{player.role}</td>
                        <td className="px-4 py-3 text-yellow-400 font-semibold">₹{player.basePrice} Cr</td>
                        <td className="px-4 py-3 text-gray-300 text-sm">
                          {player.runs}R, {player.wickets}W, SR: {(player.strikeRate ?? 0).toFixed(1)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handlePutIntoAuction(player.id)}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                          >
                            Put in Auction
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-xl h-fit">
            <h2 className="text-2xl font-bold text-white mb-4">Sell Player</h2>

            {auctionState?.currentPlayer ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Current Player</p>
                  <p className="text-white font-bold text-lg">{auctionState.currentPlayer.name}</p>
                  <p className="text-gray-300 text-sm">{auctionState.currentPlayer.role}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Team</label>
                  <select
                    value={selectedTeam || ''}
                    onChange={(e) => setSelectedTeam(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose team...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} - ₹{team.remainingBudget?.toFixed(1)} Cr left
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sold Amount (Cr)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={soldAmount}
                    onChange={(e) => setSoldAmount(e.target.value)}
                    placeholder="e.g. 6.5"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleSellPlayer}
                  disabled={loading || !selectedTeam || !soldAmount}
                  className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sell Player
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No player in auction</p>
            )}
          </div>
        </div>

        <MainAuctionView initialState={auctionState} />
      </div>
    </div>
  );
};

export default ManagerDashboard;
