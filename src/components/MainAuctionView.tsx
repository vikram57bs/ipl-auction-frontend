import React, { useEffect, useState } from 'react';
import { Player, Team, Transaction } from '../services/api';
import { getSocket } from '../services/socket';
import { Trophy, Users, DollarSign, TrendingUp } from 'lucide-react';
import Ticker from './Ticker';

interface MainAuctionViewProps {
  initialState?: any;
}

const MainAuctionView: React.FC<MainAuctionViewProps> = ({ initialState }) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(
    initialState?.currentPlayer || null
  );
  const [teamSummaries, setTeamSummaries] = useState<Team[]>(
    initialState?.teamSummaries || []
  );
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    initialState?.recentTransactions || []
  );
  const [highestBuys, setHighestBuys] = useState<Player[]>(
    initialState?.highestBuys || []
  );

  useEffect(() => {
    const socket = getSocket();

    socket.on('auction:currentPlayerUpdated', (player: Player) => {
      setCurrentPlayer(player);
    });

    socket.on('auction:playerSold', (data: any) => {
      setCurrentPlayer(null);
      setRecentTransactions((prev) => [
        {
          id: Date.now(),
          playerId: data.player.id,
          player: data.player,
          teamId: data.team.id,
          team: data.team,
          amount: data.amount,
          createdAt: data.timestamp,
        },
        ...prev.slice(0, 9),
      ]);
    });

    socket.on('auction:stateSnapshot', (state: any) => {
      setCurrentPlayer(state.currentPlayer || null);
      setTeamSummaries(state.teamSummaries || []);
      setRecentTransactions(state.recentTransactions || []);
      setHighestBuys(state.highestBuys || []);
    });

    return () => {
      socket.off('auction:currentPlayerUpdated');
      socket.off('auction:playerSold');
      socket.off('auction:stateSnapshot');
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {currentPlayer ? (
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg p-8 shadow-2xl animate-slide-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white flex items-center">
                  <Trophy className="w-8 h-8 mr-3 text-yellow-400" />
                  Current Auction
                </h2>
                <span className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-full font-bold text-sm animate-pulse">
                  LIVE
                </span>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-4xl font-bold text-white mb-4">{currentPlayer.name}</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Role</p>
                    <p className="text-white font-semibold text-lg">{currentPlayer.role}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Age</p>
                    <p className="text-white font-semibold text-lg">{currentPlayer.age}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Base Price</p>
                    <p className="text-yellow-400 font-bold text-lg">
                      ₹{currentPlayer.basePrice} Cr
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Matches</p>
                    <p className="text-white font-semibold text-lg">{currentPlayer.matches}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 bg-gray-900/50 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Runs</p>
                    <p className="text-white font-bold text-xl">{currentPlayer.runs}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">50s/100s</p>
                    <p className="text-white font-bold text-xl">
                      {currentPlayer.fifties}/{currentPlayer.hundreds}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">SR</p>
                    <p className="text-white font-bold text-xl">
                      {currentPlayer.strikeRate.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Wickets</p>
                    <p className="text-white font-bold text-xl">{currentPlayer.wickets}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Economy</p>
                    <p className="text-white font-bold text-xl">
                      {currentPlayer.economy.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-12 text-center shadow-xl">
              <Trophy className="w-20 h-20 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">No Active Auction</h3>
              <p className="text-gray-500">Waiting for the next player to be put up for auction</p>
            </div>
          )}

          <div className="mt-6 bg-gray-800 rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
              Highest Buys
            </h3>
            <div className="space-y-2">
              {highestBuys.length > 0 ? (
                highestBuys.slice(0, 5).map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-yellow-400 text-gray-900 font-bold flex items-center justify-center mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-white font-semibold">{player.name}</p>
                        <p className="text-gray-400 text-sm">{player.soldToTeam?.name}</p>
                      </div>
                    </div>
                    <span className="text-yellow-400 font-bold">₹{player.soldPrice} Cr</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No sales yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-xl h-fit">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-400" />
            Teams
          </h3>
          <div className="space-y-3">
            {teamSummaries.map((team) => (
              <div key={team.id} className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-bold">{team.name}</h4>
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    {team.playersCount || 0} players
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Remaining</span>
                  <span className="text-green-400 font-semibold">₹{team.remainingBudget?.toFixed(1)} Cr</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Spent</span>
                  <span className="text-red-400 font-semibold">₹{team.spent?.toFixed(1)} Cr</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Ticker transactions={recentTransactions} />

      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-green-400" />
          Recent Activity
        </h3>
        <div className="space-y-2">
          {recentTransactions.length > 0 ? (
            recentTransactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div>
                  <p className="text-white font-semibold">{transaction.player.name}</p>
                  <p className="text-gray-400 text-sm">
                    Sold to {transaction.team.name}
                  </p>
                </div>
                <span className="text-green-400 font-bold">₹{transaction.amount} Cr</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainAuctionView;
