export function normalizeEmail(email) {
  return email ? email.trim().toLowerCase() : undefined;
}

export function normalizePhone(phone) {
  return phone ? phone.replace(/\D/g, "") : undefined; //Only numbers
}
