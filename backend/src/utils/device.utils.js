import { UAParser } from "ua-parser-js";

/**
 * Parse User-Agent string va device ma'lumotlarini qaytarish
 * @param {string} userAgent - User-Agent string (req.headers['user-agent'])
 * @returns {Object} - Device ma'lumotlari
 */
function parseDeviceInfo(userAgent) {
  try {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const deviceInfo = {
      deviceType: result.device.type || "desktop",
      deviceModel: result.device.model || "unknown",
      os: result.os.name || "unknown",
      osVersion: result.os.version || "unknown",
      client: result.browser.name || "unknown",
      clientVersion: result.browser.version || "unknown",
    };

    return deviceInfo;
  } catch (error) {
    return {
      deviceType: "unknown",
      deviceModel: "unknown",
      os: "unknown",
      osVersion: "unknown",
      client: "unknown",
      clientVersion: "unknown",
    };
  }
}

/**
 * Device ma'lumotlaridan unique fingerprint yaratish
 * @param {Object} deviceInfo - parseDeviceInfo() dan kelgan object
 * @returns {string} - Device fingerprint (masalan: "mobile-android-chrome")
 */
function createDeviceFingerprint(deviceInfo) {
  try {
    const { deviceType, os, client } = deviceInfo;

    const fingerprint = `${deviceType}-${os}-${client}`
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    return fingerprint;
  } catch (error) {
    return "unknown-device";
  }
}

/**
 * Session uchun expiry date yaratish (30 kun)
 * @returns {Date} - 30 kun keyingi Date object
 */
function getSessionExpiryDate() {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    return expiryDate;
  } catch (error) {
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + 30);

    return fallbackDate;
  }
}

export { parseDeviceInfo, createDeviceFingerprint, getSessionExpiryDate };
