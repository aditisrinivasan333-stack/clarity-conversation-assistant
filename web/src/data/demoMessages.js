const conversation = [
  { sender: 'Maya', content: 'The client approved the new direction. Let’s prepare the revised proposal by Thursday.', read: false },
  { sender: 'Jordan', content: 'I can update the budget section this afternoon. Do we have final estimates from design?', read: true },
  { sender: 'Maya', content: 'Not yet. Alex expects to send them before lunch tomorrow.', read: true },
  { sender: 'Alex', content: 'Design estimate is ready: two weeks for implementation, plus a day for QA.', read: false },
  { sender: 'Jordan', content: 'Thanks! I’ll add that and circulate a draft for review.', read: true },
  { sender: 'Maya', content: 'Please include the accessibility checks in the timeline too.', read: true },
  { sender: 'Alex', content: 'Good point. I’ll confirm the extra testing time with the team.', read: false },
  { sender: 'Jordan', content: 'The customer call is moved to Friday at 10. I sent the updated invite.', read: true },
  { sender: 'Maya', content: 'Perfect. Let’s share the draft before then so everyone can review it.', read: true },
  { sender: 'Jordan', content: 'I’m concerned the deadline is tight unless we get feedback today.', read: false },
  { sender: 'Alex', content: 'I can review after 3 PM. The latest prototype is in the shared folder.', read: true },
  { sender: 'Maya', content: 'Great, I’ll consolidate comments and send one set of feedback.', read: true }
];

export function getDemoMessages(appId) {
  const now = Date.now();
  return conversation.map((message, index) => ({
    ...message,
    id: `demo-${appId}-${index + 1}`,
    timestamp: new Date(now - index * 60 * 60 * 1000).toISOString(),
    type: 'text',
    appId
  }));
}

export const demoSources = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    requiredPermissions: ['read_messages', 'read_media', 'access_contacts']
  },
  {
    id: 'sms',
    name: 'SMS',
    icon: '📱',
    requiredPermissions: ['read_sms', 'read_contacts']
  },
  {
    id: 'email',
    name: 'Email',
    icon: '📧',
    requiredPermissions: ['read_email', 'read_attachments']
  }
];
