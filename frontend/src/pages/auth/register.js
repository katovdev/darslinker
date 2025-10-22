import { initLoginPage } from './login.js';

export function initRegisterPage() {
  // For now, redirect to the same login page
  // Later you can create a separate register page if needed
  initLoginPage();
}