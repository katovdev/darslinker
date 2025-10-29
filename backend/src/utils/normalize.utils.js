function normalizeEmail(email) {
  return email ? email.trim().toLowerCase() : undefined;
}

function normalizePhone(phone) {
  if (!phone) return undefined;

  let normalized = phone.replace(/[^\d+]/g, "");
  if (!normalized.startsWith("+")) {
    normalized = "+" + normalized;
  }
  return normalized;
}

export { normalizeEmail, normalizePhone };
