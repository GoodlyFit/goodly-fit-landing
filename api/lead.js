const crypto = require("crypto");

const DEFAULT_PIXEL_ID = "1280984843510755";
const DEFAULT_META_VERSION = "v20.0";
const ALLOWED_ORIGINS = new Set([
  "https://goodlyfit.app",
  "https://www.goodlyfit.app",
  "https://goodly-fit-landing.vercel.app",
  "http://localhost:4180",
  "http://127.0.0.1:4180"
]);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");

  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function normalize(value) {
  return String(value || "").trim();
}

function hash(value) {
  const clean = normalize(value).toLowerCase();
  if (!clean) return "";
  return crypto.createHash("sha256").update(clean).digest("hex");
}

function digits(value) {
  return normalize(value).replace(/\D/g, "");
}

function splitName(name) {
  const parts = normalize(name).split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ")
  };
}

function getEngagementEvents(landingEngagement) {
  return Array.isArray(landingEngagement?.events) ? landingEngagement.events.slice(-80) : [];
}

function getPercentFromType(type) {
  const match = String(type || "").match(/^vsl_(\d{1,3})$/);
  return match ? Number(match[1]) : 0;
}

function summarizeLandingEngagement(landingEngagement) {
  const events = getEngagementEvents(landingEngagement);

  return events.reduce((summary, item) => {
    const type = item.type || "";
    const percent = Number(item.videoPercent || item.percent || getPercentFromType(type));

    if (type === "vsl_play") summary.vslPlayed = true;
    if (Number.isFinite(percent)) {
      summary.maxVideoPercent = Math.max(summary.maxVideoPercent, Math.round(percent));
    }
    if (type === "agenda_click") {
      summary.agendaClicked = true;
      summary.agendaClickCount += 1;
      summary.lastAgendaClickAt = item.at || summary.lastAgendaClickAt;
    }
    summary.lastEventAt = item.at || summary.lastEventAt;
    summary.eventsCount += 1;
    return summary;
  }, {
    vslPlayed: false,
    maxVideoPercent: 0,
    agendaClicked: false,
    agendaClickCount: 0,
    lastAgendaClickAt: "",
    lastEventAt: "",
    eventsCount: 0
  });
}

function jsonString(value, maxLength = 7500) {
  try {
    return JSON.stringify(value).slice(0, maxLength);
  } catch (error) {
    return "";
  }
}

function pickFirstHeader(header) {
  if (Array.isArray(header)) return header[0] || "";
  return String(header || "").split(",")[0].trim();
}

async function postToGhl(payload) {
  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  if (!webhookUrl) {
    return { ok: false, skipped: true, status: 0, text: "missing_ghl_webhook_url" };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  return { ok: response.ok, skipped: false, status: response.status, text };
}

async function postToMeta({ application, tracking, eventId, req, landingEngagementSummary }) {
  const accessToken = process.env.META_CAPI_TOKEN;
  const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;
  const graphVersion = process.env.META_GRAPH_API_VERSION || DEFAULT_META_VERSION;

  if (!accessToken) {
    return { ok: true, skipped: true, status: 0, text: "missing_meta_capi_token" };
  }

  const emailHash = hash(application.email);
  const phoneHash = hash(digits(application.whatsapp));
  const userData = {
    client_ip_address: pickFirstHeader(req.headers["x-forwarded-for"]) || req.socket?.remoteAddress || "",
    client_user_agent: req.headers["user-agent"] || "",
    fbp: tracking.fbp || "",
    fbc: tracking.fbc || ""
  };

  if (emailHash) userData.em = [emailHash];
  if (phoneHash) userData.ph = [phoneHash];

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${pixelId}/events`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      access_token: accessToken,
      data: [
        {
          event_name: "Lead",
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: "website",
          event_source_url: tracking.pageUrl || "https://www.goodlyfit.app/agenda/",
          user_data: userData,
          custom_data: {
            content_name: "Goodly Fit application",
            content_category: "Core Gold commercial diagnosis",
            business_role: application.businessRole || "",
            active_clients: application.activeClients || "",
            commercial_system: application.commercialSystem || "",
            vsl_played: landingEngagementSummary.vslPlayed ? 1 : 0,
            vsl_max_percent: landingEngagementSummary.maxVideoPercent || 0,
            agenda_clicked: landingEngagementSummary.agendaClicked ? 1 : 0,
            agenda_click_count: landingEngagementSummary.agendaClickCount || 0
          }
        }
      ]
    })
  });

  const text = await response.text();
  return { ok: response.ok, skipped: false, status: response.status, text };
}

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  try {
    const body = await readJson(req);
    const application = body.application || {};
    const tracking = body.tracking || {};
    const landingEngagement = body.landingEngagement || tracking.landingEngagement || {};
    const landingEngagementSummary = summarizeLandingEngagement(landingEngagement);
    const landingEngagementEvents = getEngagementEvents(landingEngagement);
    const eventId = normalize(body.eventId) || crypto.randomUUID();
    const { firstName, lastName } = splitName(application.name);

    if (!application.name || !application.email || !application.whatsapp) {
      res.status(400).json({ ok: false, error: "missing_required_application_fields" });
      return;
    }

    const crmPayload = {
      event: body.event || "goodly_application_completed",
      eventId,
      source: "goodlyfit.app/agenda",
      submittedAt: new Date().toISOString(),
      name: application.name || "",
      firstName,
      lastName,
      email: application.email || "",
      phone: application.whatsapp || "",
      gym: application.gym || "",
      instagram: application.instagram || "",
      businessRole: application.businessRole || "",
      commercialSystem: application.commercialSystem || "",
      activeClients: application.activeClients || "",
      decisionAttendance: application.decisionAttendance || "",
      whatsappConfirmation: application.whatsappConfirmation || "",
      pageUrl: tracking.pageUrl || "",
      referrer: tracking.referrer || "",
      utmSource: tracking.utmSource || "",
      utmMedium: tracking.utmMedium || "",
      utmCampaign: tracking.utmCampaign || "",
      utmContent: tracking.utmContent || "",
      utmTerm: tracking.utmTerm || "",
      fbclid: tracking.fbclid || "",
      fbp: tracking.fbp || "",
      fbc: tracking.fbc || "",
      landingSessionId: normalize(landingEngagement.sessionId),
      landingEngagementStartedAt: landingEngagement.startedAt || "",
      landingEngagementUpdatedAt: landingEngagement.updatedAt || landingEngagementSummary.lastEventAt || "",
      vslPlayed: landingEngagementSummary.vslPlayed,
      vslMaxPercent: landingEngagementSummary.maxVideoPercent,
      agendaClicked: landingEngagementSummary.agendaClicked,
      agendaClickCount: landingEngagementSummary.agendaClickCount,
      lastAgendaClickAt: landingEngagementSummary.lastAgendaClickAt,
      landingEngagementEventsCount: landingEngagementSummary.eventsCount,
      landingEngagementEventsJson: jsonString(landingEngagementEvents),
      landingEngagementSummary,
      landingEngagement,
      application,
      tracking,
      tags: ["Goodly Fit Landing", "Aplicacion completada"]
    };

    const [ghlResult, metaResult] = await Promise.all([
      postToGhl(crmPayload),
      postToMeta({ application, tracking, eventId, req, landingEngagementSummary })
    ]);

    const ok = ghlResult.ok && metaResult.ok;
    res.status(ok ? 200 : 502).json({
      ok,
      eventId,
      crm: {
        ok: ghlResult.ok,
        skipped: ghlResult.skipped,
        status: ghlResult.status
      },
      meta: {
        ok: metaResult.ok,
        skipped: metaResult.skipped,
        status: metaResult.status
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "lead_forwarding_failed"
    });
  }
};
