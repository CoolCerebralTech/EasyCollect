// =====================================================
// constants/reminder-templates.ts
// WhatsApp reminder message templates
// =====================================================

export interface ReminderScenario {
  id: 'early' | 'urgent' | 'late' | 'milestone' | 'complete';
  name: string;
  triggerDaysBefore?: number;
  template: (params: ReminderParams) => string;
}

export interface ReminderParams {
  recipientName: string;
  roomTitle: string;
  amount?: number;
  currency?: string;
  deadline?: string;
  roomUrl: string;
  daysRemaining?: number;
  currentTotal?: number;
  targetAmount?: number;
  completionPercentage?: number;
}

export const REMINDER_TEMPLATES: ReminderScenario[] = [
  {
    id: 'early',
    name: 'Early Reminder',
    triggerDaysBefore: 7,
    template: (p: ReminderParams) => {
      return `Hi ${p.recipientName}! 👋

Just a gentle reminder about our *${p.roomTitle}* contribution.

${p.amount ? `Your pledged amount: ${p.currency} ${p.amount.toLocaleString()}` : ''}
${p.deadline ? `⏰ Deadline: ${p.deadline}` : ''}

Track progress here: ${p.roomUrl}

Thank you for being part of this! 🙏`;
    },
  },
  {
    id: 'urgent',
    name: 'Urgent Reminder',
    triggerDaysBefore: 3,
    template: (p: ReminderParams) => {
      return `Hey ${p.recipientName}! ⚡

We're finalizing contributions for *${p.roomTitle}* soon!

${p.amount ? `Amount due: ${p.currency} ${p.amount.toLocaleString()}` : ''}
${p.daysRemaining ? `⏳ Only ${p.daysRemaining} days left!` : ''}

Please contribute at your earliest convenience: ${p.roomUrl}

We appreciate your support! 💚`;
    },
  },
  {
    id: 'late',
    name: 'Late Reminder',
    triggerDaysBefore: -1,
    template: (p: ReminderParams) => {
      return `Hello ${p.recipientName},

We noticed we haven't received your contribution for *${p.roomTitle}* yet.

${p.amount ? `Expected amount: ${p.currency} ${p.amount.toLocaleString()}` : ''}

If you've already contributed, please let us know. Otherwise, you can still contribute here: ${p.roomUrl}

Thank you! 🙏`;
    },
  },
  {
    id: 'milestone',
    name: 'Milestone Reached',
    template: (p: ReminderParams) => {
      return `🎉 Great news, ${p.recipientName}!

We've reached *${p.completionPercentage}%* of our goal for *${p.roomTitle}*!

${p.currentTotal && p.targetAmount ? `${p.currency} ${p.currentTotal.toLocaleString()} / ${p.targetAmount.toLocaleString()}` : ''}

Thanks for being part of this achievement! View details: ${p.roomUrl}

Let's keep the momentum going! 💪`;
    },
  },
  {
    id: 'complete',
    name: 'Goal Complete',
    template: (p: ReminderParams) => {
      return `🎊 Amazing news, ${p.recipientName}!

We've successfully reached our goal for *${p.roomTitle}*! 

${p.targetAmount ? `Total collected: ${p.currency} ${p.targetAmount.toLocaleString()} ✓` : ''}

Thank you for your contribution and trust. Together we did it! 🙌

View final report: ${p.roomUrl}`;
    },
  },
];