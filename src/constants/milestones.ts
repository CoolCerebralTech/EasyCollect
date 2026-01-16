// =====================================================
// constants/milestones.ts
// Milestone celebration configurations
// =====================================================

export interface Milestone {
  percentage: number;
  label: string;
  emoji: string;
  color: string;
  message: string;
}

export const MILESTONES: Milestone[] = [
  {
    percentage: 25,
    label: 'Quarter Way',
    emoji: '🌱',
    color: '#10B981',
    message: "We're off to a great start!",
  },
  {
    percentage: 50,
    label: 'Halfway There',
    emoji: '🔥',
    color: '#F59E0B',
    message: "We're halfway to our goal!",
  },
  {
    percentage: 75,
    label: 'Almost There',
    emoji: '⚡',
    color: '#EF4444',
    message: "So close! Let's push to the finish!",
  },
  {
    percentage: 100,
    label: 'Goal Reached',
    emoji: '🎉',
    color: '#8B5CF6',
    message: 'We did it! Goal achieved!',
  },
];
