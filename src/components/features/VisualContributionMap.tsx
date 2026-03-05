// =====================================================
// src/components/features/VisualContributionMap.tsx
// SVG-based contribution visualization with nodes
// =====================================================

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge'; // Added Badge Import
import { Modal } from '../ui/Modal';
import { FormatUtils } from '../../utils/format.utils';
import { ColorUtils } from '../../utils/color.utils';
import { DateService } from '../../services/date.service';
import type { RoomContribution, Currency } from '../../lib/types';
import { APP_CONFIG } from '../../lib/constants';

export interface VisualContributionMapProps {
  contributions: RoomContribution[];
  targetAmount?: number | null;
  currency: Currency;
  onNodeClick?: (contribution: RoomContribution) => void;
}

export const VisualContributionMap: React.FC<VisualContributionMapProps> = ({
  contributions,
  targetAmount,
  currency,
  onNodeClick,
}) => {
  const [selectedContribution, setSelectedContribution] = useState<RoomContribution | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });

  // ✅ FIXED: Show both Confirmed AND Pledged users so the room feels "full"
  const visibleNodes = useMemo(() => 
    contributions.filter(c => c.status === 'confirmed' || c.status === 'pledged'), 
  [contributions]);

  const confirmedTotal = useMemo(() => 
    contributions
      .filter(c => c.status === 'confirmed')
      .reduce((sum, c) => sum + c.amount, 0),
  [contributions]);

  // Handle Resize to keep SVG responsive
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Maintain square aspect ratio or minimum height
        setDimensions({ width, height: Math.max(width, 400) });
      }
    };

    window.addEventListener('resize', handleResize);
    // Call once on mount to set initial size
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate node positions and sizes
  const nodes = useMemo(() => {
    if (visibleNodes.length === 0) return [];

    const amounts = visibleNodes.map(c => c.amount);
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    
    // Center point of the SVG
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    return visibleNodes.map((contribution, index) => {
      // Calculate radius based on amount relative to max
      // If only 1 contribution or all amounts equal, use default size
      const normalizedAmount = maxAmount === minAmount 
        ? 0.5 
        : (contribution.amount - minAmount) / (maxAmount - minAmount);
      
      const radius = APP_CONFIG.visualization.minNodeRadius +
        (APP_CONFIG.visualization.maxNodeRadius - APP_CONFIG.visualization.minNodeRadius) * normalizedAmount;

      // Arrange in a "Phyllotaxis" spiral (Sunflower pattern)
      // This packs circles efficiently from the center outward
      const angle = index * 2.39996; // Golden angle in radians (~137.5 degrees)
      const c = APP_CONFIG.visualization.nodeSpacing / 2.5; // Scaling factor
      const r = c * Math.sqrt(index + 1); // Distance from center
      
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);

      // Determine Color
      let nodeColor;
      if (contribution.status === 'pledged') {
        nodeColor = '#FBBF24'; // Amber-400 for Pledged/Pending
      } else {
        nodeColor = ColorUtils.getAmountColor(contribution.amount, minAmount, maxAmount);
      }

      return {
        contribution,
        position: { x, y, radius },
        color: nodeColor,
      };
    });
  }, [visibleNodes, dimensions]);

  const handleNodeClick = (contribution: RoomContribution) => {
    setSelectedContribution(contribution);
    if (onNodeClick) {
      onNodeClick(contribution);
    }
  };

  if (visibleNodes.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="text-6xl mb-4">🌱</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Room is Empty
        </h3>
        <p className="text-gray-600">
          Add a contribution or pledge to see the first node appear here!
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card padding="none" className="overflow-hidden">
        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Visual Map
              </h3>
              <p className="text-sm text-gray-600">
                {visibleNodes.length} members
                {targetAmount && ` • ${FormatUtils.formatCurrency(confirmedTotal, currency)} collected`}
              </p>
            </div>
            {/* Legend */}
            <div className="flex flex-col gap-1 text-xs text-gray-500 bg-white/50 p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span>Pledged</span>
              </div>
            </div>
          </div>
        </div>

        <div ref={containerRef} className="relative w-full bg-slate-50 transition-all duration-300">
          <svg
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="w-full h-auto touch-pan-x touch-pan-y"
            style={{ minHeight: '400px', maxHeight: '600px' }}
          >
            {/* Connection lines (Optional visual effect) */}
            {nodes.map((node, i) => {
              if (i === 0) return null;
              const prevNode = nodes[i - 1];
              return (
                <line
                  key={`line-${i}`}
                  x1={prevNode.position.x}
                  y1={prevNode.position.y}
                  x2={node.position.x}
                  y2={node.position.y}
                  stroke="#CBD5E1"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.3"
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(({ contribution, position, color }, index) => {
              const isPledged = contribution.status === 'pledged';
              return (
                <g
                  key={contribution.id}
                  onClick={() => handleNodeClick(contribution)}
                  className="cursor-pointer transition-transform duration-200 hover:opacity-90"
                  style={{ transformOrigin: `${position.x}px ${position.y}px` }}
                >
                  {/* Outer glow/pulse */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={position.radius + 4}
                    fill={color}
                    opacity="0.15"
                    className="animate-pulse-slow"
                  />
                  
                  {/* Main circle */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={position.radius}
                    fill={color}
                    stroke="white"
                    strokeWidth={isPledged ? "2" : "3"}
                    strokeDasharray={isPledged ? "4,2" : "0"} // Dashed border for pledges
                    className="drop-shadow-sm transition-all hover:stroke-gray-200"
                  />
                  
                  {/* Amount text (Only show if node is big enough) */}
                  {position.radius > 20 && (
                    <text
                      x={position.x}
                      y={position.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isPledged ? "#78350F" : "white"} // Dark text on yellow, White on green
                      fontSize={Math.max(10, position.radius / 2.5)}
                      fontWeight="700"
                      style={{ textShadow: isPledged ? 'none' : '0px 1px 2px rgba(0,0,0,0.3)' }}
                    >
                      {FormatUtils.formatCompactNumber(contribution.amount)}
                    </text>
                  )}
                  
                  {/* Index label below node */}
                  <text
                    x={position.x}
                    y={position.y + position.radius + 14}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="11"
                    fontWeight="600"
                  >
                    #{index + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </Card>

      {/* Contribution Details Modal */}
      {selectedContribution && (
        <Modal
          isOpen={!!selectedContribution}
          onClose={() => setSelectedContribution(null)}
          title="Member Details"
          size="sm"
        >
          <div className="space-y-4">
            <div className="text-center pb-4 border-b border-gray-100">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl ${
                selectedContribution.status === 'confirmed' ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {selectedContribution.status === 'confirmed' ? '👤' : '⏳'}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{selectedContribution.name}</h3>
              <p className={`font-bold text-2xl mt-1 ${
                selectedContribution.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {FormatUtils.formatCurrency(selectedContribution.amount, currency)}
              </p>
              
              <div className="mt-2">
                <Badge variant={selectedContribution.status === 'confirmed' ? 'success' : 'warning'}>
                  {selectedContribution.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="text-gray-500 block mb-1 text-xs uppercase tracking-wide">Date</label>
                <p className="font-medium text-gray-900">
                  {selectedContribution.confirmed_at
                    ? DateService.formatDate(selectedContribution.confirmed_at, 'short')
                    : 'Pending Payment'}
                </p>
              </div>
              <div>
                <label className="text-gray-500 block mb-1 text-xs uppercase tracking-wide">Method</label>
                <p className="font-medium text-gray-900">{selectedContribution.payment_method}</p>
              </div>
              {selectedContribution.transaction_ref && (
                <div className="col-span-2">
                  <label className="text-gray-500 block mb-1 text-xs uppercase tracking-wide">Reference</label>
                  <p className="font-mono text-gray-700 bg-white border px-2 py-1 rounded text-xs">
                    {selectedContribution.transaction_ref}
                  </p>
                </div>
              )}
            </div>

            {selectedContribution.notes && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 italic border border-blue-100">
                "{selectedContribution.notes}"
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};