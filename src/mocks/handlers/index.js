import { http, HttpResponse, delay } from 'msw';
import { users, campaigns, leads, events, emailTemplates } from '../data';

const API_BASE = '/api/v1';

// Simulate auth token
let currentUser = null;

// Helper to check auth
const requireAuth = (request) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  }
  return null;
};

export const handlers = [
  // ========== AUTH ==========
  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    await delay(500);
    const body = await request.json();
    const newUser = {
      id: users.length + 1,
      email: body.email,
      full_name: body.full_name,
      company_name: body.company_name || null,
      is_active: true,
      is_verified: false,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    await delay(500);
    const body = await request.json();
    const user = users.find((u) => u.email === body.email);
    if (!user) {
      // For demo, create user on the fly
      currentUser = users[0];
    } else {
      currentUser = user;
    }
    return HttpResponse.json({
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      token_type: 'bearer',
    });
  }),

  http.post(`${API_BASE}/auth/refresh`, async () => {
    await delay(200);
    return HttpResponse.json({
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      token_type: 'bearer',
    });
  }),

  http.get(`${API_BASE}/auth/me`, async ({ request }) => {
    await delay(200);
    const authError = requireAuth(request);
    if (authError) return authError;
    return HttpResponse.json(currentUser || users[0]);
  }),

  http.patch(`${API_BASE}/auth/me`, async ({ request }) => {
    await delay(300);
    const authError = requireAuth(request);
    if (authError) return authError;
    const body = await request.json();
    const user = currentUser || users[0];
    Object.assign(user, body);
    return HttpResponse.json(user);
  }),

  // ========== CAMPAIGNS ==========
  http.get(`${API_BASE}/campaigns/`, async ({ request }) => {
    await delay(300);
    const authError = requireAuth(request);
    if (authError) return authError;
    return HttpResponse.json(campaigns);
  }),

  http.post(`${API_BASE}/campaigns/`, async ({ request }) => {
    await delay(500);
    const authError = requireAuth(request);
    if (authError) return authError;
    const body = await request.json();
    const newCampaign = {
      id: campaigns.length + 1,
      user_id: 1,
      ...body,
      status: 'draft',
      total_leads: 0,
      leads_contacted: 0,
      leads_responded: 0,
      leads_qualified: 0,
      leads_converted: 0,
      current_task_id: null,
      last_error: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    campaigns.push(newCampaign);
    return HttpResponse.json(newCampaign, { status: 201 });
  }),

  http.get(`${API_BASE}/campaigns/:id`, async ({ request, params }) => {
    await delay(200);
    const authError = requireAuth(request);
    if (authError) return authError;
    const campaign = campaigns.find((c) => c.id === parseInt(params.id));
    if (!campaign) {
      return HttpResponse.json({ detail: 'Campaign not found' }, { status: 404 });
    }
    return HttpResponse.json(campaign);
  }),

  http.patch(`${API_BASE}/campaigns/:id`, async ({ request, params }) => {
    await delay(300);
    const authError = requireAuth(request);
    if (authError) return authError;
    const campaign = campaigns.find((c) => c.id === parseInt(params.id));
    if (!campaign) {
      return HttpResponse.json({ detail: 'Campaign not found' }, { status: 404 });
    }
    const body = await request.json();
    Object.assign(campaign, body, { updated_at: new Date().toISOString() });
    return HttpResponse.json(campaign);
  }),

  http.delete(`${API_BASE}/campaigns/:id`, async ({ request, params }) => {
    await delay(300);
    const authError = requireAuth(request);
    if (authError) return authError;
    const index = campaigns.findIndex((c) => c.id === parseInt(params.id));
    if (index !== -1) {
      campaigns.splice(index, 1);
    }
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API_BASE}/campaigns/:id/stats`, async ({ request, params }) => {
    await delay(200);
    const authError = requireAuth(request);
    if (authError) return authError;
    const campaign = campaigns.find((c) => c.id === parseInt(params.id));
    if (!campaign) {
      return HttpResponse.json({ detail: 'Campaign not found' }, { status: 404 });
    }
    const campaignLeads = leads.filter((l) => l.campaign_id === campaign.id);
    const tierDistribution = { A: 0, B: 0, C: 0, D: 0 };
    campaignLeads.forEach((l) => {
      if (l.tier) tierDistribution[l.tier]++;
    });
    return HttpResponse.json({
      campaign_id: campaign.id,
      total_leads: campaign.total_leads,
      leads_contacted: campaign.leads_contacted,
      leads_responded: campaign.leads_responded,
      leads_qualified: campaign.leads_qualified,
      leads_converted: campaign.leads_converted,
      tier_distribution: tierDistribution,
      average_score: 52.3,
      status: campaign.status,
    });
  }),

  // ========== LEADS ==========
  http.get(`${API_BASE}/campaigns/:campaignId/leads/`, async ({ request, params }) => {
    await delay(300);
    const authError = requireAuth(request);
    if (authError) return authError;
    const url = new URL(request.url);
    const tier = url.searchParams.get('tier');
    const status = url.searchParams.get('status');

    let filtered = leads.filter((l) => l.campaign_id === parseInt(params.campaignId));
    if (tier) filtered = filtered.filter((l) => l.tier === tier);
    if (status) filtered = filtered.filter((l) => l.status === status);

    return HttpResponse.json(filtered);
  }),

  http.get(`${API_BASE}/campaigns/:campaignId/leads/:leadId`, async ({ request, params }) => {
    await delay(200);
    const authError = requireAuth(request);
    if (authError) return authError;
    const lead = leads.find(
      (l) => l.campaign_id === parseInt(params.campaignId) && l.id === parseInt(params.leadId)
    );
    if (!lead) {
      return HttpResponse.json({ detail: 'Lead not found' }, { status: 404 });
    }
    return HttpResponse.json(lead);
  }),

  http.patch(`${API_BASE}/campaigns/:campaignId/leads/:leadId`, async ({ request, params }) => {
    await delay(300);
    const authError = requireAuth(request);
    if (authError) return authError;
    const lead = leads.find(
      (l) => l.campaign_id === parseInt(params.campaignId) && l.id === parseInt(params.leadId)
    );
    if (!lead) {
      return HttpResponse.json({ detail: 'Lead not found' }, { status: 404 });
    }
    const body = await request.json();
    Object.assign(lead, body, { updated_at: new Date().toISOString() });
    return HttpResponse.json(lead);
  }),

  http.get(`${API_BASE}/campaigns/:campaignId/leads/:leadId/events`, async ({ request, params }) => {
    await delay(200);
    const authError = requireAuth(request);
    if (authError) return authError;
    const leadEvents = events.filter((e) => e.lead_id === parseInt(params.leadId));
    return HttpResponse.json(leadEvents);
  }),

  // ========== PIPELINE ==========
  http.post(`${API_BASE}/campaigns/:id/pipeline/run`, async ({ request, params }) => {
    await delay(300);
    const authError = requireAuth(request);
    if (authError) return authError;
    const campaign = campaigns.find((c) => c.id === parseInt(params.id));
    if (campaign) {
      campaign.status = 'collecting';
      campaign.current_task_id = 'task_' + Date.now();
    }
    return HttpResponse.json({
      task_id: campaign?.current_task_id || 'task_' + Date.now(),
      status: 'started',
      message: 'Full pipeline started (collect -> enrich -> score)',
    });
  }),

  http.get(`${API_BASE}/campaigns/:id/pipeline/status`, async ({ request, params }) => {
    await delay(200);
    const authError = requireAuth(request);
    if (authError) return authError;
    const campaign = campaigns.find((c) => c.id === parseInt(params.id));
    // Simulate pipeline completion after a few seconds
    if (campaign && campaign.current_task_id) {
      // For demo, mark as complete
      return HttpResponse.json({
        task_id: campaign.current_task_id,
        status: 'SUCCESS',
        result: { campaign_id: campaign.id, leads_collected: campaign.total_leads },
      });
    }
    return HttpResponse.json({
      task_id: '',
      status: 'ready',
      result: { message: 'No task currently running' },
    });
  }),

  // ========== OUTREACH ==========
  http.get(`${API_BASE}/campaigns/:id/outreach/templates`, async ({ request }) => {
    await delay(200);
    const authError = requireAuth(request);
    if (authError) return authError;
    return HttpResponse.json({ templates: emailTemplates });
  }),

  http.post(`${API_BASE}/campaigns/:id/outreach/preview`, async ({ request }) => {
    await delay(300);
    const authError = requireAuth(request);
    if (authError) return authError;
    const body = await request.json();
    const lead = leads.find((l) => l.id === body.lead_id);
    const campaign = campaigns.find((c) => c.id === parseInt(request.url.split('/')[5]));

    return HttpResponse.json({
      to_email: lead?.contact_info?.primary_email || 'unknown@example.com',
      subject: `Quick question about ${lead?.business_name || 'your business'}`,
      body: `Hi ${lead?.contact_info?.contact_name || 'there'},\n\nI noticed ${lead?.business_name || 'your business'} and wanted to reach out.\n\n${campaign?.personalization?.value_propositions?.[0] || 'We help businesses like yours grow.'}\n\nWould you be open to a brief conversation about how we might help?\n\nBest regards,\n${campaign?.personalization?.company_name || 'Our Team'}`,
      template_name: body.template_name,
    });
  }),

  http.post(`${API_BASE}/campaigns/:id/outreach/send`, async ({ request }) => {
    await delay(500);
    const authError = requireAuth(request);
    if (authError) return authError;
    const body = await request.json();
    const lead = leads.find((l) => l.id === body.lead_id);
    if (lead) {
      lead.status = 'contacted';
      // Add event
      events.unshift({
        id: events.length + 1,
        lead_id: lead.id,
        event_type: 'email_sent',
        channel: 'email',
        event_data: { template: body.template_name },
        created_at: new Date().toISOString(),
      });
    }
    return HttpResponse.json({
      task_id: 'send_' + Date.now(),
      status: 'started',
      message: `Sending email to ${lead?.contact_info?.primary_email}`,
    });
  }),

  // ========== EVENTS ==========
  http.get(`${API_BASE}/events/recent`, async ({ request }) => {
    await delay(200);
    const authError = requireAuth(request);
    if (authError) return authError;
    return HttpResponse.json(events.slice(0, 20));
  }),
];

export default handlers;
