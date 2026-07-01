const crypto = require("crypto");

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

async function fetchCalendlyResource(uri) {
  const token = process.env.CALENDLY_TOKEN;
  if (!token || !uri) return null;

  const response = await fetch(uri, {
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    }
  });

  if (!response.ok) return null;
  const payload = await response.json();
  return payload.resource || null;
}

function pickMeetingLink(eventResource) {
  const location = eventResource?.location || {};
  return (
    location.join_url ||
    location.location ||
    location.url ||
    eventResource?.meeting_link ||
    ""
  );
}

function formatDateTime(value, timezone) {
  if (!value) return { date: "", time: "" };

  const timeZone = timezone || "America/Argentina/Buenos_Aires";
  const date = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone
  }).format(new Date(value));
  const time = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone
  }).format(new Date(value));

  return { date, time };
}

async function postToGhl(payload) {
  const webhookUrl = process.env.GHL_APPOINTMENT_WEBHOOK_URL;
  if (!webhookUrl) {
    return { ok: true, skipped: true, status: 0, text: "missing_ghl_appointment_webhook_url" };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
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
    const calendly = body.calendly || {};
    const eventId = normalize(body.eventId) || crypto.randomUUID();
    const eventUri = calendly.event?.uri || calendly.eventUri || "";
    const inviteeUri = calendly.invitee?.uri || calendly.inviteeUri || "";

    if (!application.email || !application.whatsapp) {
      res.status(400).json({ ok: false, error: "missing_required_application_fields" });
      return;
    }

    const [eventResource, inviteeResource] = await Promise.all([
      fetchCalendlyResource(eventUri),
      fetchCalendlyResource(inviteeUri)
    ]);

    const appointment = {
      eventUri,
      inviteeUri,
      startTime: eventResource?.start_time || "",
      endTime: eventResource?.end_time || "",
      status: eventResource?.status || "",
      eventName: eventResource?.name || "",
      timezone: inviteeResource?.timezone || eventResource?.timezone || "",
      meetingLink: pickMeetingLink(eventResource),
      cancelUrl: inviteeResource?.cancel_url || "",
      rescheduleUrl: inviteeResource?.reschedule_url || ""
    };
    const appointmentDateTime = formatDateTime(appointment.startTime, appointment.timezone);

    const crmPayload = {
      event: body.event || "goodly_call_scheduled",
      eventId,
      source: "goodlyfit.app/agenda",
      submittedAt: new Date().toISOString(),
      name: application.name || "",
      email: application.email || "",
      phone: application.whatsapp || "",
      gym: application.gym || "",
      instagram: application.instagram || "",
      businessRole: application.businessRole || "",
      commercialSystem: application.commercialSystem || "",
      activeClients: application.activeClients || "",
      decisionAttendance: application.decisionAttendance || "",
      whatsappConfirmation: application.whatsappConfirmation || "",
      appointmentStartTime: appointment.startTime,
      appointmentEndTime: appointment.endTime,
      appointmentDate: appointmentDateTime.date,
      appointmentTime: appointmentDateTime.time,
      meetingLink: appointment.meetingLink,
      cancelUrl: appointment.cancelUrl,
      rescheduleUrl: appointment.rescheduleUrl,
      timezone: appointment.timezone,
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
      appointment,
      calendly,
      tracking,
      tags: ["Goodly Fit Landing", "Cita agendada"]
    };

    const ghlResult = await postToGhl(crmPayload);

    res.status(ghlResult.ok ? 200 : 502).json({
      ok: ghlResult.ok,
      eventId,
      appointment: {
        hydrated: Boolean(eventResource || inviteeResource),
        hasMeetingLink: Boolean(appointment.meetingLink),
        startTime: appointment.startTime,
        endTime: appointment.endTime
      },
      crm: {
        ok: ghlResult.ok,
        skipped: ghlResult.skipped,
        status: ghlResult.status
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "appointment_forwarding_failed"
    });
  }
};
