import React from 'react';
import { Transaction } from '../services/api';
import { TrendingUp } from 'lucide-react';

interface TickerProps {
  transactions: Transaction[];
}

const Ticker: React.FC<TickerProps> = ({ transactions }) => {
  if (transactions.length === 0) return null;

  const tickerItems = transactions.slice(0, 10).map((t) => (
    `${t.player.name} sold to ${t.team.name} for ₹${t.amount} Cr`
  ));

  const tickerText = tickerItems.join('  •  ');

  return (
    <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-4 overflow-hidden shadow-lg">
      <div className="flex items-center">
        <div className="flex items-center mr-4 bg-white/20 px-3 py-1 rounded-full">
          <TrendingUp className="w-5 h-5 text-white mr-2" />
          <span className="text-white font-bold text-sm">LATEST SALES</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="ticker-container">
            <div className="ticker-content">
              <span className="text-white font-semibold">{tickerText}</span>
              <span className="text-white font-semibold ml-16">{tickerText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticker;
