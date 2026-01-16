// =====================================================
// components/features/VisualContributionMap.tsx
// SVG-based contribution visualization with nodes
// =====================================================

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { FormatUtils } from '../../utils/format.utils';
import { ColorUtils } from '../../utils/color.utils';
import { DateService } from '../../services/date.service';
import type { RoomContribution, Currency } from '../../lib/types';
import { APP_CONFIG } from '../../constants/app-config';

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

  const confirmedContributions = useMemo(() => 
    contributions.filter(c => c.status === 'confirmed'), 
  [contributions]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Maintain square aspect ratio or minimum height
        setDimensions({ width, height: Math.max(width, 400) });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate node positions and sizes
  const nodes = useMemo(() => {
    if (confirmedContributions.length === 0) return [];

    const amounts = confirmedContributions.map(c => c.amount);
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    
    // Center point
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    return confirmedContributions.map((contribution, index) => {
      // Calculate radius based on amount relative to max
      // If only 1 contribution, avoid division by zero
      const normalizedAmount = maxAmount === minAmount 
        ? 0.5 
        : (contribution.amount - minAmount) / (maxAmount - minAmount);
      
      const radius = APP_CONFIG.visualization.minNodeRadius +
        (APP_CONFIG.visualization.maxNodeRadius - APP_CONFIG.visualization.minNodeRadius) * normalizedAmount;

      // Arrange in a "Phyllotaxis" spiral (Sunflower pattern)
      // This packs circles efficiently
      const angle = index * 2.39996; // Golden angle in radians
      const c = APP_CONFIG.visualization.nodeSpacing / 2; // Scaling factor
      const r = c * Math.sqrt(index + 1);
      
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);

      return {
        contribution,
        position: { x, y, radius },
        color: ColorUtils.getAmountColor(contribution.amount, minAmount, maxAmount),
      };
    });
  }, [confirmedContributions, dimensions]);

  const handleNodeClick = (contribution: RoomContribution) => {
    setSelectedContribution(contribution);
    if (onNodeClick) {
      onNodeClick(contribution);
    }
  };

  if (confirmedContributions.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="text-6xl mb-4">💚</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No contributions yet
        </h3>
        <p className="text-gray-600">
          Be the first to contribute and see your node appear here!
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card padding="none" className="overflow-hidden">
        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Contribution Map
          </h3>
          <p className="text-sm text-gray-600">
            {confirmedContributions.length} contribution{confirmedContributions.length !== 1 ? 's' : ''}
            {targetAmount && ` • ${FormatUtils.formatCurrency(
              confirmedContributions.reduce((sum, c) => sum + c.amount, 0),
              currency
            )} collected`}
          </p>
        </div>

        <div ref={containerRef} className="relative w-full bg-slate-50">
          <svg
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="w-full h-auto touch-pan-x touch-pan-y"
            style={{ minHeight: '400px' }}
          >
            {/* Connection lines (Optional: connect in chronological order) */}
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
                  opacity="0.4"
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(({ contribution, position, color }, index) => {
              return (
                <g
                  key={contribution.id}
                  onClick={() => handleNodeClick(contribution)}
                  className="cursor-pointer transition-transform duration-200 hover:opacity-90"
                  style={{ transformOrigin: `${position.x}px ${position.y}px` }}
                >
                  {/* Outer glow for visibility */}
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
                    strokeWidth="2"
                    className="drop-shadow-sm"
                  />
                  
                  {/* Amount text (Only show if node is big enough) */}
                  {position.radius > 25 && (
                    <text
                      x={position.x}
                      y={position.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={Math.max(10, position.radius / 2.5)}
                      fontWeight="700"
                      style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
                    >
                      {FormatUtils.formatCompactNumber(contribution.amount)}
                    </text>
                  )}
                  
                  {/* Index label (Tooltip style below node) */}
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
          title="Contribution Details"
          size="sm"
        >
          <div className="space-y-4">
            <div className="text-center pb-4 border-b border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                👤
              </div>
              <h3 className="text-xl font-bold text-gray-900">{selectedContribution.name}</h3>
              <p className="text-green-600 font-bold text-2xl mt-1">
                {FormatUtils.formatCurrency(selectedContribution.amount, currency)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-gray-500 block mb-1">Date</label>
                <p className="font-medium">
                  {selectedContribution.confirmed_at
                    ? DateService.formatDate(selectedContribution.confirmed_at, 'short')
                    : 'Pending'}
                </p>
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Method</label>
                <p className="font-medium">{selectedContribution.payment_method}</p>
              </div>
            </div>

            {selectedContribution.notes && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic">
                "{selectedContribution.notes}"
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};