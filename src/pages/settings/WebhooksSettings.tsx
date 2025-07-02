import React from 'react';
import WebhookSettings from '@/components/settings/WebhookSettings';

export const WebhooksSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Webhooks</h2>
        <p className="text-gray-500">Configure integrações e webhooks</p>
      </div>

      <WebhookSettings />
    </div>
  );
}; 