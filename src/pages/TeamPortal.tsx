import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, Player, Team } from '../services/api';
import { initializeSocket } from '../services/socket';
import MainAuctionView from '../components/MainAuctionView';
import { Users, LogOut, TrendingUp, DollarSign, Award, BarChart3 } from 'lucide-react';

const TeamPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'auction' | 'squad' | 'analytics' | 'others'>('auction');
  const [auctionState, setAuctionState] = useState<any>(null);
  const [mySquad, setMySquad] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedOtherTeam, setSelectedOtherTeam] = useState<number | null>(null);
  const [otherTeamSquad, setOtherTeamSquad] = useState<any>(null);

  useEffect(() => {
    initializeSocket();
    loadData();
  }, []);

  useEffect(() => {
    if (selectedOtherTeam) {
      loadOtherTeamSquad(selectedOtherTeam);
    }
  }, [selectedOtherTeam]);

  const loadData = async () => {
    try {
      const [stateData, teamsData] = await Promise.all([
        api.getAuctionState(),
        api.getTeamsSummary(),
      ]);
      setAuctionState(stateData);
      setTeams(teamsData);

      if (user?.team?.id) {
        const [squadData, analyticsData] = await Promise.all([
          api.getTeamSquad(user.team.id),
          api.getTeamAnalytics(user.team.id),
        ]);
        setMySquad(squadData);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadOtherTeamSquad = async (teamId: number) => {
    try {
      const squadData = await api.getTeamSquad(teamId);
      setOtherTeamSquad(squadData);
    } catch (error) {
      console.error('Error loading other team squad:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleColors: Record<string, string> = {
    Batsman: 'bg-blue-600',
    Bowler: 'bg-red-600',
    'All-Rounder': 'bg-green-600',
    'Wicket-Keeper': 'bg-purple-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Award className="w-8 h-8 mr-3 text-yellow-400" />
              {user?.team?.name || 'Team'} Portal
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
        <div className="flex space-x-2 mb-6 bg-gray-800 p-2 rounded-lg">
          <button
            onClick={() => setActiveTab('auction')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              activeTab === 'auction'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Live Auction
          </button>
          <button
            onClick={() => setActiveTab('squad')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              activeTab === 'squad'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            My Squad
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('others')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              activeTab === 'others'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Other Teams
          </button>
        </div>

        {activeTab === 'auction' && <MainAuctionView initialState={auctionState} />}

        {activeTab === 'squad' && mySquad && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Total Players</p>
                    <p className="text-white text-3xl font-bold">{mySquad.playersCount}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-200 text-sm mb-1">Total Spent</p>
                    <p className="text-white text-3xl font-bold">₹{mySquad.totalSpent?.toFixed(1)} Cr</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-red-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm mb-1">Remaining Budget</p>
                    <p className="text-white text-3xl font-bold">₹{mySquad.remainingBudget?.toFixed(1)} Cr</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-200" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-400" />
                Squad Players
              </h2>
              {mySquad.players.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Matches</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Runs</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Wickets</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">SR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {mySquad.players.map((player: Player) => (
                        <tr key={player.id} className="hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3 text-white font-medium">{player.name}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 ${roleColors[player.role] || 'bg-gray-600'} text-white text-xs rounded-full`}>
                              {player.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-green-400 font-semibold">₹{player.soldPrice} Cr</td>
                          <td className="px-4 py-3 text-gray-300">{player.matches}</td>
                          <td className="px-4 py-3 text-gray-300">{player.runs}</td>
                          <td className="px-4 py-3 text-gray-300">{player.wickets}</td>
                          <td className="px-4 py-3 text-gray-300">{player.strikeRate.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No players bought yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-400" />
                  Highest Buy
                </h3>
                {analytics.highestBuy ? (
                  <div>
                    <p className="text-white font-bold text-xl">{analytics.highestBuy.name}</p>
                    <p className="text-gray-400">{analytics.highestBuy.role}</p>
                    <p className="text-green-400 font-bold text-2xl mt-2">₹{analytics.highestBuy.soldPrice} Cr</p>
                  </div>
                ) : (
                  <p className="text-gray-400">No purchases yet</p>
                )}
              </div>

              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                  Lowest Buy
                </h3>
                {analytics.lowestBuy ? (
                  <div>
                    <p className="text-white font-bold text-xl">{analytics.lowestBuy.name}</p>
                    <p className="text-gray-400">{analytics.lowestBuy.role}</p>
                    <p className="text-green-400 font-bold text-2xl mt-2">₹{analytics.lowestBuy.soldPrice} Cr</p>
                  </div>
                ) : (
                  <p className="text-gray-400">No purchases yet</p>
                )}
              </div>

              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                  Average Spend
                </h3>
                <p className="text-white font-bold text-3xl">₹{analytics.averageSpend?.toFixed(2)} Cr</p>
                <p className="text-gray-400 mt-2">Per player</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4">Players by Role</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.roleDistribution || {}).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-white font-medium">{role}</span>
                      <span className={`px-3 py-1 ${roleColors[role] || 'bg-gray-600'} text-white rounded-full font-bold`}>
                        {String(count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4">Spend by Role</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.spendByRole || {}).map(([role, spend]) => (
                    <div key={role} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-white font-medium">{role}</span>
                      <span className="text-green-400 font-bold">₹{Number(spend).toFixed(1)} Cr</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'others' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Select Team to View</h2>
              <select
                value={selectedOtherTeam || ''}
                onChange={(e) => setSelectedOtherTeam(parseInt(e.target.value))}
                className="w-full md:w-1/2 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a team...</option>
                {teams.filter((t) => t.id !== user?.team?.id).map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {otherTeamSquad && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-200 text-sm mb-1">Total Players</p>
                        <p className="text-white text-3xl font-bold">{otherTeamSquad.playersCount}</p>
                      </div>
                      <Users className="w-12 h-12 text-blue-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-200 text-sm mb-1">Total Spent</p>
                        <p className="text-white text-3xl font-bold">₹{otherTeamSquad.totalSpent?.toFixed(1)} Cr</p>
                      </div>
                      <DollarSign className="w-12 h-12 text-red-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-200 text-sm mb-1">Remaining Budget</p>
                        <p className="text-white text-3xl font-bold">₹{otherTeamSquad.remainingBudget?.toFixed(1)} Cr</p>
                      </div>
                      <TrendingUp className="w-12 h-12 text-green-200" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-4">{otherTeamSquad.name} Squad</h3>
                  {otherTeamSquad.players.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Matches</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Runs</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Wickets</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {otherTeamSquad.players.map((player: Player) => (
                            <tr key={player.id} className="hover:bg-gray-700/50 transition-colors">
                              <td className="px-4 py-3 text-white font-medium">{player.name}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 ${roleColors[player.role] || 'bg-gray-600'} text-white text-xs rounded-full`}>
                                  {player.role}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-green-400 font-semibold">₹{player.soldPrice} Cr</td>
                              <td className="px-4 py-3 text-gray-300">{player.matches}</td>
                              <td className="px-4 py-3 text-gray-300">{player.runs}</td>
                              <td className="px-4 py-3 text-gray-300">{player.wickets}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No players bought yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPortal;
