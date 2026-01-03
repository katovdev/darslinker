// Assignment player page - Use renderAssignmentContent for unified player
import { t, initI18n } from '../../utils/i18n.js';

function syncAssignmentCompletion(course, lesson) {
  if (!course || !lesson) return;

  if (window.markLessonComplete) {
    window.markLessonComplete(course._id, lesson._id);
  }

  if (window.courseProgress && Array.isArray(window.courseProgress.completedLessons)) {
    if (!window.courseProgress.completedLessons.includes(lesson._id)) {
      window.courseProgress.completedLessons.push(lesson._id);
    }
  }

  if (window.updateSidebarActiveLesson) {
    window.updateSidebarActiveLesson(course, lesson);
  }
}

export async function loadAssignmentPlayer(course, lesson, sidebarHtml) {
  // Initialize i18n
  initI18n();
  
  console.log('📝 Assignment player loaded successfully');
  
  console.log('📝 Loading assignment player:', lesson.title);

  const appContainer = document.getElementById('app') || document.body;

  appContainer.innerHTML = `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #232323;
        color: #ffffff;
        overflow: hidden;
      }

      /* Sticky Header */
      .assignment-header {
        position: sticky;
        top: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 40px;
        background: #232323;
        border-bottom: 1px solid rgba(126, 162, 212, 0.2);
        backdrop-filter: blur(10px);
      }

      /* Mobile Header */
      @media (max-width: 768px) {
        .assignment-header {
          padding: 15px 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .header-logo .logo-text {
          font-size: 20px;
        }

        .header-actions {
          gap: 8px;
        }

        .icon-btn {
          width: 36px;
          height: 36px;
        }

        .back-btn {
          padding: 0 12px !important;
        }

        .back-text {
          font-size: 12px;
        }

        .logout-btn {
          padding: 0 12px !important;
        }

        .logout-text {
          font-size: 12px;
        }
      }

      .header-logo {
        display: flex;
        align-items: center;
      }

      .logo-text {
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
      }

      .logo-highlight {
        color: var(--primary-color);
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .icon-btn {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 8px;
        color: #9CA3AF;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .icon-btn:hover {
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
        color: #ffffff;
        border-color: var(--primary-color);
      }

      .back-btn {
        width: auto !important;
        padding: 0 16px !important;
        gap: 8px;
        border-color: rgba(255, 255, 255, 0.25);
        color: #e5e7eb;
      }

      .back-btn:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.45);
      }

      .back-text {
        font-size: 14px;
        font-weight: 500;
        color: inherit;
      }

      .logout-btn {
        width: auto !important;
        padding: 0 16px !important;
        gap: 8px;
        border-color: var(--primary-color) !important;
        color: var(--primary-color) !important;
      }

      .logout-text {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-color);
      }

      .logout-modal {
        position: fixed;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }

      .logout-modal.is-active {
        display: flex;
      }

      .logout-modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(2px);
      }

      .logout-modal-content {
        position: relative;
        z-index: 1;
        width: min(420px, 90vw);
        background: #232323;
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
      }

      .logout-modal-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 8px;
        color: #ffffff;
      }

      .logout-modal-text {
        font-size: 14px;
        color: #9CA3AF;
        line-height: 1.5;
      }

      .logout-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 20px;
      }

      .logout-modal-btn {
        border-radius: 10px;
        padding: 10px 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.2s ease;
      }

      .logout-modal-cancel {
        background: rgba(255, 255, 255, 0.06);
        color: #e5e7eb;
        border-color: rgba(255, 255, 255, 0.12);
      }

      .logout-modal-cancel:hover {
        background: rgba(255, 255, 255, 0.12);
      }

      .logout-modal-confirm {
        background: color-mix(in srgb, var(--primary-color) 25%, transparent);
        color: var(--primary-color);
        border-color: color-mix(in srgb, var(--primary-color) 45%, transparent);
      }

      .logout-modal-confirm:hover {
        background: color-mix(in srgb, var(--primary-color) 35%, transparent);
      }

      /* Layout */
      .assignment-layout {
        display: flex;
        height: calc(100vh - 81px);
        overflow: hidden;
      }

      /* Mobile Layout */
      @media (max-width: 768px) {
        .assignment-layout {
          flex-direction: column;
          height: calc(100vh - 71px);
        }
      }

      /* Sticky Sidebar */
      .assignment-sidebar {
        width: 320px;
        background: #2a2a2a;
        border-right: 1px solid rgba(126, 162, 212, 0.15);
        overflow-y: auto;
        flex-shrink: 0;
        position: sticky;
        top: 81px;
        height: calc(100vh - 81px);
      }

      /* Mobile Sidebar */
      @media (max-width: 768px) {
        .assignment-sidebar {
          width: 100%;
          height: auto;
          max-height: 40vh;
          position: relative;
          top: 0;
          border-right: none;
          border-bottom: 1px solid rgba(126, 162, 212, 0.15);
        }
      }

      @media (max-width: 480px) {
        .assignment-sidebar {
          max-height: 35vh;
        }
      }

      .assignment-sidebar::-webkit-scrollbar {
        width: 6px;
      }

      .assignment-sidebar::-webkit-scrollbar-thumb {
        background: rgba(126, 162, 212, 0.3);
        border-radius: 3px;
      }

      .sidebar-header {
        padding: 24px;
        border-bottom: 1px solid rgba(126, 162, 212, 0.2);
      }

      .sidebar-course-title {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
      }

      /* Mobile Sidebar Header */
      @media (max-width: 768px) {
        .sidebar-header {
          padding: 16px 20px;
        }

        .sidebar-course-title {
          font-size: 14px;
        }
      }

      /* Sidebar Modules */
      .sidebar-modules {
        padding: 12px 0;
      }

      .sidebar-module {
        border-bottom: 1px solid rgba(126, 162, 212, 0.1);
      }

      .sidebar-module-header {
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: background 0.2s;
      }

      /* Mobile Sidebar Module */
      @media (max-width: 768px) {
        .sidebar-module-header {
          padding: 12px 20px;
        }

        .sidebar-module-title {
          font-size: 14px;
        }

        .sidebar-lesson {
          padding: 10px 20px 10px 36px;
        }

        .sidebar-lesson-title {
          font-size: 13px;
        }

        .sidebar-lesson-duration {
          font-size: 11px;
        }
      }

      .sidebar-module-header:hover {
        background: rgba(126, 162, 212, 0.05);
      }

      .sidebar-module-title {
        flex: 1;
        font-size: 15px;
        font-weight: 600;
        color: #ffffff;
      }

      .sidebar-module-count {
        font-size: 12px;
        color: #9CA3AF;
      }

      .sidebar-module-arrow {
        color: var(--primary-color);
        font-size: 12px;
        transition: transform 0.3s;
      }

      .sidebar-module-arrow.rotated {
        transform: rotate(-180deg);
      }

      .sidebar-module-lessons {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }

      .sidebar-module-lessons.expanded {
        max-height: 2000px;
      }

      .sidebar-lesson {
        padding: 14px 24px 14px 44px;
        display: flex;
        align-items: center;
        gap: 14px;
        cursor: pointer;
        transition: all 0.2s;
        border-left: 4px solid transparent;
      }

      .sidebar-lesson:hover {
        background: rgba(126, 162, 212, 0.1);
      }

      .sidebar-lesson.active {
        background: color-mix(in srgb, var(--primary-color) 20%, transparent);
        border-left-color: var(--primary-color);
      }

      .sidebar-lesson-icon {
        color: var(--primary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
      }

      .sidebar-lesson-icon svg {
        display: block;
      }

      .sidebar-lesson-info {
        flex: 1;
      }

      .sidebar-lesson-title {
        font-size: 14px;
        color: #ffffff;
        margin-bottom: 4px;
        font-weight: 500;
      }

      .sidebar-lesson-duration {
        font-size: 12px;
        color: #9CA3AF;
      }

      /* Main Content */
      .assignment-content {
        flex: 1;
        overflow-y: auto;
        padding: 40px 60px;
        background: #1a1a1a;
      }

      /* Mobile Main Content */
      @media (max-width: 768px) {
        .assignment-content {
          padding: 20px;
          height: calc(60vh - 71px);
        }
      }

      @media (max-width: 480px) {
        .assignment-content {
          padding: 15px;
          height: calc(65vh - 71px);
        }
      }

      .assignment-content::-webkit-scrollbar {
        width: 8px;
      }

      .assignment-content::-webkit-scrollbar-thumb {
        background: rgba(126, 162, 212, 0.3);
        border-radius: 4px;
      }

      .assignment-container {
        max-width: 900px;
        margin: 0 auto;
      }

      /* Mobile Assignment Container */
      @media (max-width: 768px) {
        .assignment-container {
          max-width: 100%;
          margin: 0;
        }
      }

      /* Assignment Header */
      .assignment-title {
        font-size: 36px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 16px;
      }

      .assignment-meta {
        display: flex;
        gap: 24px;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 1px solid rgba(126, 162, 212, 0.2);
      }

      /* Mobile Assignment Header */
      @media (max-width: 768px) {
        .assignment-title {
          font-size: 24px;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .assignment-meta {
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
        }

        .meta-item {
          font-size: 13px;
        }
      }

      @media (max-width: 480px) {
        .assignment-title {
          font-size: 20px;
        }

        .assignment-meta {
          gap: 8px;
          margin-bottom: 16px;
        }
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #9CA3AF;
      }

      .meta-icon {
        color: var(--primary-color);
      }

      /* Assignment Instruction */
      .assignment-section {
        margin-bottom: 32px;
      }

      .section-title {
        font-size: 14px !important;
        font-weight: 500 !important;
        color: #ffffff;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      h2.section-title {
        font-size: 14px !important;
        font-weight: 500 !important;
      }

      /* Mobile Assignment Section */
      @media (max-width: 768px) {
        .assignment-section {
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 13px !important;
          margin-bottom: 6px;
        }

        h2.section-title {
          font-size: 13px !important;
        }
      }

      @media (max-width: 480px) {
        .assignment-section {
          margin-bottom: 16px;
        }
      }

      .section-content {
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 12px;
        padding: 24px;
        color: #E5E7EB;
        line-height: 1.6;
      }

      /* File Attachment */
      .file-attachment {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: rgba(126, 162, 212, 0.1);
        border: 1px solid rgba(126, 162, 212, 0.3);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .file-attachment:hover {
        background: color-mix(in srgb, var(--primary-color) 15%, transparent);
        border-color: var(--primary-color);
      }

      .file-icon {
        width: 40px;
        height: 40px;
        background: var(--primary-color);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .file-info {
        flex: 1;
      }

      .file-name {
        font-size: 11px;
        font-weight: 500;
        color: #ffffff;
        margin-bottom: 3px;
      }

      .file-size {
        font-size: 9px;
        color: #9CA3AF;
      }

      /* Submit Section */
      .submit-section {
        background: rgba(58, 56, 56, 0.5);
        border: 2px dashed rgba(126, 162, 212, 0.3);
        border-radius: 12px;
        padding: 32px;
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .submit-section.drag-over {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      }

      .submit-section.uploading {
        pointer-events: none;
        opacity: 0.7;
      }

      .upload-area {
        margin-bottom: 24px;
      }

      .upload-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 16px;
        background: rgba(126, 162, 212, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
      }

      .upload-text {
        font-size: 12px;
        color: #E5E7EB;
        margin-bottom: 6px;
      }

      .upload-hint {
        font-size: 10px;
        color: #9CA3AF;
      }

      .upload-btn {
        padding: 12px 32px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .upload-btn:hover {
        background: color-mix(in srgb, var(--primary-color) 85%, #000);
        transform: translateY(-1px);
      }

      .upload-btn.change-file {
        background: color-mix(in srgb, var(--primary-color) 20%, transparent);
        border: 1px solid color-mix(in srgb, var(--primary-color) 50%, transparent);
        color: var(--primary-color);
        font-size: 12px;
        padding: 8px 16px;
        margin-top: 8px;
      }

      .upload-btn.change-file:hover {
        background: rgba(126, 162, 212, 0.3);
        transform: none;
      }

      /* Actions */
      .assignment-actions {
        display: flex;
        gap: 16px;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        justify-content: flex-end;
      }

      .btn {
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }

      .btn-primary {
        background: var(--primary-color);
        color: white;
      }

      .btn-primary:hover {
        background: var(--primary-color);
        opacity: 0.85;
      }

      .btn-primary:disabled {
        background: color-mix(in srgb, var(--primary-color) 50%, transparent);
        cursor: not-allowed;
        opacity: 0.6;
      }

      .btn-secondary {
        background: rgba(58, 56, 56, 0.5);
        color: #E5E7EB;
        border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
      }

      .btn-secondary:hover {
        background: rgba(58, 56, 56, 0.65);
        opacity: 1;
      }

      .upload-progress {
        width: 100%;
        background: rgba(58, 56, 56, 0.5);
        border-radius: 8px;
        height: 8px;
        margin-top: 16px;
        overflow: hidden;
      }

      .upload-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 85%, #000));
        transition: width 0.3s ease;
        border-radius: 8px;
      }

      .upload-status {
        margin-top: 16px;
        font-size: 14px;
        color: #E5E7EB;
      }

      .upload-status.success {
        color: #10B981;
      }

      .upload-status.error {
        color: #EF4444;
      }

      .upload-status.submitted {
        color: #10B981;
        border: 1px solid rgba(16, 185, 129, 0.3);
        background: rgba(16, 185, 129, 0.1);
        padding: 16px;
        border-radius: 8px;
        margin-top: 12px;
        line-height: 1.8;
      }

      .upload-status.submitted strong {
        color: #10B981;
      }

      .upload-status.submitted small {
        color: rgba(16, 185, 129, 0.8);
      }

      /* Toast Notifications */
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .toast {
        background: rgba(42, 42, 42, 0.95);
        border: 1px solid rgba(126, 162, 212, 0.3);
        border-radius: 12px;
        padding: 16px 20px;
        color: #111111;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .toast.show {
        transform: translateX(0);
        opacity: 1;
      }

      .toast.success {
        border-color: rgba(16, 185, 129, 0.5);
        background: rgba(16, 185, 129, 0.1);
      }

      .toast.error {
        border-color: rgba(239, 68, 68, 0.5);
        background: rgba(239, 68, 68, 0.1);
      }

      .toast.info {
        border-color: rgba(126, 162, 212, 0.5);
        background: rgba(126, 162, 212, 0.1);
      }

      .toast-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .toast-icon.success {
        color: #10B981;
      }

      .toast-icon.error {
        color: #EF4444;
      }

      .toast-icon.info {
        color: var(--primary-color);
      }

      .toast-content {
        flex: 1;
      }

      .toast-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .toast-message {
        font-size: 13px;
        color: #111111;
        line-height: 1.4;
      }

      .toast-close {
        width: 20px;
        height: 20px;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        transition: color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .toast-close:hover {
        color: rgba(255, 255, 255, 0.9);
      }
    </style>

    <!-- Header -->
    <header class="assignment-header">
      <div class="header-logo">
        <span class="logo-text">dars<span class="logo-highlight">linker</span></span>
      </div>
      <div class="header-actions">
        <button class="icon-btn back-btn" onclick="handleBackToDashboard()" title="${t('success.backToDashboard')}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5m7 7l-7-7 7-7"/>
          </svg>
          <span class="back-text">${t('success.backToDashboard')}</span>
        </button>
        <button class="icon-btn logout-btn" onclick="openLogoutModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span class="logout-text">${t('header.logout')}</span>
        </button>
      </div>
    </header>

    <div class="logout-modal" id="logoutModal" aria-hidden="true">
      <div class="logout-modal-backdrop" onclick="closeLogoutModal()"></div>
      <div class="logout-modal-content" role="dialog" aria-modal="true" aria-labelledby="logoutModalTitle">
        <h3 class="logout-modal-title" id="logoutModalTitle">${t('courseLearning.logoutConfirmTitle')}</h3>
        <p class="logout-modal-text">${t('courseLearning.logoutConfirmBody')}</p>
        <div class="logout-modal-actions">
          <button class="logout-modal-btn logout-modal-cancel" type="button" onclick="closeLogoutModal()">${t('courseLearning.logoutConfirmCancel')}</button>
          <button class="logout-modal-btn logout-modal-confirm" type="button" onclick="confirmLogout()">${t('courseLearning.logoutConfirmConfirm')}</button>
        </div>
      </div>
    </div>

    <!-- Layout -->
    <div class="assignment-layout">
      <!-- Sticky Sidebar -->
      ${sidebarHtml}

      <!-- Main Content -->
      <div class="assignment-content">
        <div class="assignment-container">
          <!-- Assignment Header -->
          <h1 class="assignment-title">${lesson.title || t('assignment.title')}</h1>
          
          ${lesson.duration ? `
          <div class="assignment-meta">
            <div class="meta-item">
              <svg class="meta-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span>${lesson.duration}</span>
            </div>
          </div>
          ` : ''}

          <!-- Instruction -->
          ${lesson.instructions ? `
          <div class="assignment-section">
            <h2 class="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              ${t('assignment.instruction')}
            </h2>
            <div class="section-content">
              ${lesson.instructions}
            </div>
          </div>
          ` : ''}

          <!-- Attachments -->
          ${lesson.fileUrl ? `
          <div class="assignment-section">
            <h2 class="section-title">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
              ${t('assignment.attachments')}
            </h2>
            <div onclick="downloadFile('${lesson.fileUrl}', 'assignment_file')" class="file-attachment">
              <div class="file-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <div class="file-info">
                <div class="file-name">${t('assignment.assignmentFile')}</div>
                <div class="file-size">${t('assignment.clickToDownload')}</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            </div>
          </div>
          ` : ''}

          <!-- Submit Section -->
          <div class="assignment-section">
            <h2 class="section-title">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              ${t('assignment.submitYourWork')}
            </h2>
            <div class="submit-section" id="submitSection" onclick="chooseFile()" ondragover="handleDragOver(event)" ondrop="handleDrop(event)" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)">
              <div class="upload-area">
                <div class="upload-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3"/>
                  </svg>
                </div>
                <div class="upload-text" id="uploadText">${t('assignment.dragDropFile')}</div>
                <div class="upload-hint">${t('assignment.or')}</div>
              </div>
              <button class="upload-btn" onclick="chooseFile()">
                ${t('assignment.chooseFile')}
              </button>
              <input type="file" id="fileInput" style="display: none;" onchange="handleFileSelect(event)">
              <div class="upload-progress" id="uploadProgress" style="display: none;">
                <div class="upload-progress-bar" id="uploadProgressBar" style="width: 0%"></div>
              </div>
              <div class="upload-status" id="uploadStatus"></div>
            </div>
          </div>

          <!-- Actions -->
          <div class="assignment-actions">
            <button class="btn btn-primary" id="submitBtn" onclick="submitAssignment()" disabled>
              ${t('assignment.submitAssignment')}
            </button>
            <button class="btn btn-secondary" onclick="if(window.markCompleteAndGoNext && window.currentCourse && window.currentLesson) { window.markCompleteAndGoNext(window.currentCourse._id, window.currentLesson._id); } else { window.history.back(); }">
              ${t('assignment.nextLesson')}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Container -->
    <div id="toastContainer" class="toast-container"></div>
  `;

  // Toast notification system
  window.showToast = function(title, message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;

    // Get icon based on type
    let iconSvg = '';
    switch(type) {
      case 'success':
        iconSvg = '<svg class="toast-icon success" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>';
        break;
      case 'error':
        iconSvg = '<svg class="toast-icon error" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>';
        break;
      default:
        iconSvg = '<svg class="toast-icon info" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>';
        break;
    }

    toast.innerHTML = ''+iconSvg+
      '<div class="toast-content">'+
        '<div class="toast-title">'+title+'</div>'+
        (message ? '<div class="toast-message">'+message+'</div>' : '')+
      '</div>'+
      '<button class="toast-close" onclick="hideToast(this.parentElement)">'+
        '<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">'+
          '<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />'+
        '</svg>'+
      '</button>';

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        hideToast(toast);
      }, duration);
    }
  };

  window.hideToast = function(toast) {
    if (!toast) return;

    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  };

  // File upload variables
  let uploadedFileUrl = null;
  let uploadedFileName = null;

  // Generate unique key for this assignment
  const assignmentKey = 'assignment_' + lesson._id + '_' + course._id;
  const submissionKey = 'submitted_' + lesson._id + '_' + course._id;

  // Restore previously uploaded file (if any)
  function restorePreviousUpload() {
    try {
      const savedFile = localStorage.getItem(assignmentKey);
      if (savedFile) {
        const fileData = JSON.parse(savedFile);

        // Check if file data is valid and recent (within 24 hours)
        const uploadTime = new Date(fileData.uploadedAt);
        const now = new Date();
        const hoursSinceUpload = (now - uploadTime) / (1000 * 60 * 60);

        if (hoursSinceUpload < 24 && fileData.fileUrl && fileData.fileName) {
          uploadedFileUrl = fileData.fileUrl;
          uploadedFileName = fileData.fileName;

          // Update UI to show previously uploaded file
          const uploadText = document.getElementById('uploadText');
          const uploadStatus = document.getElementById('uploadStatus');
          const submitBtn = document.getElementById('submitBtn');
          const uploadProgress = document.getElementById('uploadProgress');
          const uploadProgressBar = document.getElementById('uploadProgressBar');

          if (uploadText) uploadText.textContent = t('assignment.previouslyUploaded') + ' ' + fileData.fileName;
          if (uploadStatus) {
            uploadStatus.textContent = t('assignment.fileReady').replace('{fileName}', fileData.fileName);
            uploadStatus.className = 'upload-status success';
          }
          if (submitBtn) submitBtn.disabled = false;
          if (uploadProgress) uploadProgress.style.display = 'block';
          if (uploadProgressBar) uploadProgressBar.style.width = '100%';

          // Show change file button
          showChangeFileButton();

          console.log('📁 Restored previous upload:', fileData.fileName);
        }
      }
    } catch (error) {
      console.error('Error restoring previous upload:', error);
      // Clean up invalid data
      localStorage.removeItem(assignmentKey);
    }
  }

  // Save uploaded file data
  function saveUploadedFile(fileUrl, fileName) {
    try {
      const fileData = {
        fileUrl: fileUrl,
        fileName: fileName,
        uploadedAt: new Date().toISOString(),
        lessonId: lesson._id,
        courseId: course._id
      };
      localStorage.setItem(assignmentKey, JSON.stringify(fileData));
      console.log('💾 Saved upload data for future sessions');
    } catch (error) {
      console.error('Error saving upload data:', error);
    }
  }

  // Clear saved file data (after successful submission)
  function clearSavedFile() {
    try {
      localStorage.removeItem(assignmentKey);
      console.log('🗑️ Cleared saved upload data');
    } catch (error) {
      console.error('Error clearing upload data:', error);
    }
  }

  // Show change file button for previously uploaded files
  function showChangeFileButton() {
    const submitSection = document.getElementById('submitSection');
    if (!submitSection) return;

    // Check if change button already exists
    if (document.getElementById('changeFileBtn')) return;

    // Create change file button
    const changeBtn = document.createElement('button');
    changeBtn.id = 'changeFileBtn';
    changeBtn.className = 'upload-btn change-file';
    changeBtn.textContent = t('assignment.changeFile');
    changeBtn.onclick = function() {
      // Reset upload state
      uploadedFileUrl = null;
      uploadedFileName = null;

      // Clear saved data
      clearSavedFile();

      // Reset UI
      const uploadText = document.getElementById('uploadText');
      const uploadStatus = document.getElementById('uploadStatus');
      const submitBtn = document.getElementById('submitBtn');
      const uploadProgress = document.getElementById('uploadProgress');

      if (uploadText) uploadText.textContent = 'Drag and drop your file here';
      if (uploadStatus) {
        uploadStatus.textContent = '';
        uploadStatus.className = 'upload-status';
      }
      if (submitBtn) submitBtn.disabled = true;
      if (uploadProgress) uploadProgress.style.display = 'none';

      // Remove change button
      changeBtn.remove();

      // Open file dialog
      chooseFile();
    };

    // Add button after the main upload button
    const uploadBtn = submitSection.querySelector('.upload-btn:not(.change-file)');
    if (uploadBtn && uploadBtn.parentNode) {
      uploadBtn.parentNode.insertBefore(changeBtn, uploadBtn.nextSibling);
    }
  }

  // Check if assignment was already submitted
  function checkSubmissionStatus() {
    try {
      const submissionData = localStorage.getItem(submissionKey);
      if (submissionData) {
        const submission = JSON.parse(submissionData);
        const submissionTime = new Date(submission.submittedAt);

        // Show submission status
        showSubmissionStatus(submission);
        return true;
      }
    } catch (error) {
      console.error('Error checking submission status:', error);
      localStorage.removeItem(submissionKey);
    }
    return false;
  }

  // Show that assignment was already submitted
  function showSubmissionStatus(submission) {
    const uploadText = document.getElementById('uploadText');
    const uploadStatus = document.getElementById('uploadStatus');
    const submitBtn = document.getElementById('submitBtn');
    const submitSection = document.getElementById('submitSection');

    if (uploadText) uploadText.textContent = 'Assignment already submitted';
    if (uploadStatus) {
      const submitTime = new Date(submission.submittedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      let statusHtml = '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><strong>' + t('assignment.submitted') + '</strong></div>' + 
        '<div style="margin-left: 26px;">' + submission.fileName + '<br>' +
        '<small>' + t('assignment.submittedOn') + ' ' + submitTime + '</small></div>';
      
      // Show grade if graded
      if (submission.status === 'graded' && submission.grade !== undefined) {
        // Determine grade color based on score
        let gradeColor = '#10B981'; // Green for 80+
        if (submission.grade < 60) {
          gradeColor = '#EF4444'; // Red for below 60
        } else if (submission.grade < 80) {
          gradeColor = '#F59E0B'; // Yellow/Orange for 60-79
        }
        
        statusHtml += '<div style="text-align: center; margin-top: 20px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">' +
          '<div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + gradeColor + '" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg><strong style="font-size: 15px;">Grade</strong></div>' +
          '<div style="font-size: 32px; font-weight: 700; color: ' + gradeColor + ';">' + submission.grade + '%</div>' +
          '</div>';
      }
      
      // Show feedback if available
      if (submission.feedback) {
        statusHtml += '<div style="text-align: center; margin-top: 16px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">' +
          '<div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg><strong style="font-size: 15px;">Feedback</strong></div>' +
          '<div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6;">' + submission.feedback + '</div>' +
          '</div>';
      }
      
      uploadStatus.innerHTML = statusHtml;
      uploadStatus.className = 'upload-status submitted';
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Already Submitted';
    }
    if (submitSection) {
      submitSection.style.pointerEvents = 'none';
      submitSection.style.opacity = '0.7';
    }

    console.log('📋 Assignment already submitted:', submission.fileName);
    syncAssignmentCompletion(course, lesson);
  }

  // Mark assignment as submitted
  function markAsSubmitted(fileUrl, fileName) {
    try {
      const submissionData = {
        fileUrl: fileUrl,
        fileName: fileName,
        submittedAt: new Date().toISOString(),
        lessonId: lesson._id,
        courseId: course._id
      };
      localStorage.setItem(submissionKey, JSON.stringify(submissionData));
      console.log('✅ Marked assignment as submitted');
    } catch (error) {
      console.error('Error marking submission:', error);
    }
  }

  // Check submission status from backend
  async function checkBackendSubmission() {
    try {
      const landingUser = JSON.parse(sessionStorage.getItem('landingUser') || '{}');
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
      
      console.log('🔍 Checking backend for existing submission...');
      
      const response = await fetch(
        `${apiBaseUrl}/submissions/student/${landingUser._id}/lesson/${lesson._id}`
      );
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.submission) {
          console.log('✅ Found existing submission in DB:', result.submission);
          
          // Show submission status from DB
          const submission = result.submission;
          showSubmissionStatus({
            fileUrl: submission.fileUrl,
            fileName: submission.fileName,
            submittedAt: submission.submittedAt,
            status: submission.status,
            grade: submission.grade,
            feedback: submission.feedback
          });
          
          return true;
        }
      }
      
      console.log('📭 No submission found in DB');
      return false;
      
    } catch (error) {
      console.error('Error checking backend submission:', error);
      return false;
    }
  }

  // Check submission status first, then restore upload if not submitted
  setTimeout(async () => {
    const hasBackendSubmission = await checkBackendSubmission();
    
    if (!hasBackendSubmission) {
      // Check localStorage as fallback
      const isSubmitted = checkSubmissionStatus();
      if (!isSubmitted) {
        restorePreviousUpload();
      }
    }
  }, 100);

  // Drag and drop handlers
  window.handleDragOver = function(event) {
    event.preventDefault();
    event.stopPropagation();
  };

  window.handleDragEnter = function(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('submitSection').classList.add('drag-over');
  };

  window.handleDragLeave = function(event) {
    event.preventDefault();
    event.stopPropagation();
    // Only remove drag-over if leaving the submit section entirely
    if (!event.currentTarget.contains(event.relatedTarget)) {
      document.getElementById('submitSection').classList.remove('drag-over');
    }
  };

  window.handleDrop = function(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('submitSection').classList.remove('drag-over');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  // File selection
  window.chooseFile = function() {
    document.getElementById('fileInput').click();
  };

  window.handleFileSelect = function(event) {
    const file = event.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  // File upload function
  window.uploadFile = async function(file) {
    const submitSection = document.getElementById('submitSection');
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadProgressBar = document.getElementById('uploadProgressBar');
    const uploadStatus = document.getElementById('uploadStatus');
    const uploadText = document.getElementById('uploadText');
    const submitBtn = document.getElementById('submitBtn');

    // Reset UI
    submitSection.classList.add('uploading');
    uploadProgress.style.display = 'block';
    uploadStatus.textContent = 'Uploading file...';
    uploadStatus.className = 'upload-status';
    uploadProgressBar.style.width = '0%';
    submitBtn.disabled = true;

    try {
      // Get current student ID from session
      const landingUser = JSON.parse(sessionStorage.getItem('landingUser') || '{}');

      // Debug token
      console.log('🔐 Token debug:', {
        hasUser: !!landingUser,
        hasToken: !!landingUser.token,
        tokenPreview: landingUser.token ? landingUser.token.substring(0, 20) + '...' : 'none'
      });

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload file with progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          uploadProgressBar.style.width = percentComplete + '%';
        }
      };

      xhr.onload = function() {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            uploadedFileUrl = response.url;
            uploadedFileName = file.name;

            uploadStatus.textContent = 'File "' + file.name + '" uploaded successfully!';
            uploadStatus.className = 'upload-status success';
            uploadText.textContent = 'Selected: ' + file.name;
            submitBtn.disabled = false;
            uploadProgressBar.style.width = '100%';

            // Save file data for future sessions
            saveUploadedFile(response.url, file.name);

            // Show change file button
            showChangeFileButton();

            // Show success toast
            showToast('File Uploaded!', 'Your file has been uploaded successfully. You can now submit the assignment.', 'success', 3000);
          } else {
            throw new Error(response.message || 'Upload failed');
          }
        } else if (xhr.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (xhr.status === 413) {
          throw new Error('File too large. Please choose a smaller file.');
        } else {
          throw new Error('Upload failed (Status: ' + xhr.status + ')');
        }
        submitSection.classList.remove('uploading');
      };

      xhr.onerror = function() {
        submitSection.classList.remove('uploading');
        uploadStatus.textContent = 'Upload failed. Please try again.';
        uploadStatus.className = 'upload-status error';
        uploadProgress.style.display = 'none';

        showToast('Upload Failed', 'Failed to upload file. Please check your connection and try again.', 'error', 5000);
      };

      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
      const uploadUrl = `${apiBaseUrl}/upload/document`;

      // Send request to upload endpoint
      xhr.open('POST', uploadUrl);

      // Add auth header if available
      if (landingUser.token) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + landingUser.token);
      }

      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      submitSection.classList.remove('uploading');
      uploadStatus.textContent = 'Upload failed. Please try again.';
      uploadStatus.className = 'upload-status error';
      uploadProgress.style.display = 'none';

      showToast('Upload Error', 'An unexpected error occurred during upload. Please try again.', 'error', 5000);
    }
  };

  // Submit assignment
  window.submitAssignment = async function() {
    if (!uploadedFileUrl) {
      showToast('Upload Required', 'Please upload a file before submitting the assignment.', 'error', 4000);
      return;
    }

    try {
      const landingUser = JSON.parse(sessionStorage.getItem('landingUser') || '{}');
      const submitBtn = document.getElementById('submitBtn');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      // Submit to backend API
      const submissionData = {
        courseId: course._id,
        lessonId: lesson._id,
        studentId: landingUser._id,
        fileUrl: uploadedFileUrl,
        fileName: uploadedFileName,
        lessonTitle: lesson.title,
        instructions: lesson.instructions
      };

      console.log('📤 Submitting assignment:', {
        courseId: submissionData.courseId,
        lessonId: submissionData.lessonId,
        studentId: submissionData.studentId,
        fileName: submissionData.fileName,
        lessonTitle: submissionData.lessonTitle,
      });

      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
      const url = `${apiBaseUrl}/submissions/lesson-assignment`;
      console.log('🌐 Submission URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      console.log('📥 Response status:', response.status, response.statusText);

      const result = await response.json();
      console.log('📦 Response data:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to submit assignment');
      }

      // Mark as submitted and clear saved file data
      markAsSubmitted(uploadedFileUrl, uploadedFileName);
      clearSavedFile();
      syncAssignmentCompletion(course, lesson);

      showToast('Assignment Submitted!', 'Your submission has been recorded successfully.', 'success', 3000);
      console.log('✅ Assignment submitted successfully!');

      // Show "Next Lesson" button instead of auto-redirect
      const submitButton = document.getElementById('submitBtn');
      const actionsDiv = document.querySelector('.assignment-actions');
      
      if (submitButton) {
        submitButton.textContent = 'Topshirildi ✓';
        submitButton.disabled = true;
      }
      
      if (actionsDiv && window.currentCourse && window.currentLesson) {
        // Add Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-primary';
        nextBtn.textContent = 'Keyingi dars →';
        nextBtn.onclick = () => {
          if (window.markCompleteAndGoNext) {
            window.markCompleteAndGoNext(window.currentCourse._id, window.currentLesson._id);
          }
        };
        actionsDiv.insertBefore(nextBtn, actionsDiv.firstChild);
      }

    } catch (error) {
      console.error('❌ Submission error:', error);
      showToast('Submission Failed', 'Failed to submit assignment: ' + error.message, 'error', 5000);

      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Assignment';
    }
  };

  // Download file handler
  window.downloadFile = function(url, filename) {
    try {
      // Create download link directly (bypasses CORS)
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'assignment_file';
      link.target = '_blank';

      // Add CORS workaround attributes
      link.rel = 'noopener noreferrer';

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab
      window.open(url, '_blank');
    }
  };

  // Build lessons list HTML for sidebar
  function buildLessonsListHtml(course, currentLesson) {
    let html = '';

    if (course.modules) {
      course.modules.forEach((module, moduleIndex) => {
        html += `
          <div class="sidebar-module">
            <div class="sidebar-module-header" onclick="togglePlayerModule(${moduleIndex})">
              <span class="sidebar-module-title">${module.title || `Module ${moduleIndex + 1}`}</span>
              <span class="sidebar-module-count">${module.lessons?.length || 0} dars</span>
              <span class="sidebar-module-arrow" id="player-arrow-${moduleIndex}">▼</span>
            </div>
            <div class="sidebar-module-lessons" id="player-lessons-${moduleIndex}">
              ${module.lessons && module.lessons.length > 0
                ? module.lessons.map((lesson, lessonIndex) => {
                    const isActive = lesson._id === currentLesson._id;

                    return `
                    <div class="sidebar-lesson ${isActive ? 'active' : ''}"
                         onclick="openLesson('${module._id}', '${lesson._id}')">
                      <div class="sidebar-lesson-icon">
                        ${lesson.type === 'video'
                          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                               <path d="M8 5v14l11-7z"/>
                             </svg>`
                          : lesson.type === 'quiz'
                          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                               <path d="M9 11l3 3L22 4"></path>
                               <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                             </svg>`
                          : lesson.type === 'assignment'
                          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                               <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                             </svg>`
                          : lesson.type === 'file'
                          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                               <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                             </svg>`
                          : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                               <polyline points="14 2 14 8 20 8"></polyline>
                             </svg>`
                        }
                      </div>
                      <div class="sidebar-lesson-info">
                        <div class="sidebar-lesson-title">${lesson.title || `Lesson ${lessonIndex + 1}`}</div>
                        ${lesson.duration ? `<div class="sidebar-lesson-duration">${lesson.duration}</div>` : ''}
                      </div>
                    </div>
                  `;
                  }).join('')
                : '<div style="padding: 20px; text-align: center; color: #9CA3AF;">No lessons</div>'
              }
            </div>
          </div>
        `;
      });
    }

    return html;
  }

  // Logout handler
  window.handleBackToDashboard = function() {
    const teacherId = sessionStorage.getItem('currentTeacherId');
    const landingUser = sessionStorage.getItem('landingUser');
    const target = teacherId && landingUser
      ? `/teacher/${teacherId}/student-dashboard`
      : '/student-dashboard';

    import('../../utils/router.js').then(({ router }) => {
      router.navigate(target);
    }).catch(() => {
      window.location.href = target;
    });
  };

  window.openLogoutModal = function() {
    const logoutModal = document.getElementById('logoutModal');
    if (!logoutModal) return;
    logoutModal.dataset.prevOverflow = document.body.style.overflow || '';
    logoutModal.classList.add('is-active');
    logoutModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeLogoutModal = function() {
    const logoutModal = document.getElementById('logoutModal');
    if (!logoutModal) return;
    logoutModal.classList.remove('is-active');
    logoutModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = logoutModal.dataset.prevOverflow || '';
  };

  window.confirmLogout = function() {
    window.closeLogoutModal();
    window.handleLogout();
  };

  window.handleLogout = function() {
    sessionStorage.removeItem('landingUser');
    sessionStorage.removeItem('currentTeacherId');
    window.location.href = '/';
  };

  // Module toggle function (from course-learning.js)
  window.togglePlayerModule = function(index) {
    const lessonsDiv = document.getElementById('player-lessons-' + index);
    const arrow = document.getElementById('player-arrow-' + index);
    
    if (lessonsDiv && arrow) {
      lessonsDiv.classList.toggle('expanded');
      arrow.classList.toggle('rotated');
    }
  };

  // Open lesson function
  window.openLesson = async function(moduleId, lessonId) {
    console.log('Opening lesson:', moduleId, lessonId);

    // Find the lesson
    let selectedLesson = null;
    const module = course.modules.find(m => m._id === moduleId);
    if (module && module.lessons) {
      selectedLesson = module.lessons.find(l => l._id === lessonId);
    }

    if (selectedLesson) {
      // Check lesson type and load appropriate player
      if (selectedLesson.type === 'video') {
        // Load video player directly
        const { loadLessonPlayer } = await import('./course-learning.js');
        await loadLessonPlayer(course, selectedLesson);
      } else if (selectedLesson.type === 'quiz') {
        // Build sidebar HTML for quiz player
        const sidebarHtml = `
          <div class="lesson-sidebar" id="lessonSidebar">
            <div class="sidebar-header">
              <span class="sidebar-course-title">${course.title || 'Course'}</span>
            </div>
            <div class="sidebar-modules">
              ${buildLessonsListHtml(course, selectedLesson)}
            </div>
          </div>
        `;
        const { loadQuizPlayer } = await import('./quiz-player.js');
        await loadQuizPlayer(course, selectedLesson, sidebarHtml);
      } else if (selectedLesson.type === 'assignment' || selectedLesson.type === 'file') {
        // Build sidebar HTML for assignment/file players
        const sidebarHtml = `
          <div class="assignment-sidebar">
            <div class="sidebar-header">
              <span class="sidebar-course-title">${course.title || 'Course'}</span>
            </div>
            <div class="sidebar-modules">
              ${buildLessonsListHtml(course, selectedLesson)}
            </div>
          </div>
        `;

        if (selectedLesson.type === 'assignment') {
          // Already in assignment player, just reload current assignment
          window.location.reload();
        } else if (selectedLesson.type === 'file') {
          try {
            const { loadFilePlayer } = await import('./file-player.js');
            await loadFilePlayer(course, selectedLesson, sidebarHtml);
          } catch (error) {
            console.error('Error loading file player:', error);
            window.location.reload();
          }
        }
      }
    }
  };

  // Auto-expand module containing current lesson
  setTimeout(() => {
    if (course.modules) {
      course.modules.forEach((module, index) => {
        if (module.lessons && module.lessons.some(l => l._id === lesson._id)) {
          const lessonsDiv = document.getElementById('player-lessons-' + index);
          const arrow = document.getElementById('player-arrow-' + index);
          if (lessonsDiv && arrow) {
            lessonsDiv.classList.add('expanded');
            arrow.classList.add('rotated');
          }
        }
      });
    }
  }, 100);
}

// NEW: Content-only rendering for unified player
export async function renderAssignmentContent(contentArea, course, lesson) {
  // Initialize i18n
  initI18n();
  
  console.log('📝 Rendering assignment content only:', lesson.title);
  
  // Store course and lesson globally for submit button
  window.currentCourse = course;
  window.currentLesson = lesson;

  contentArea.innerHTML = `
    <style>
      /* Assignment-specific styles */
      .assignment-content-wrapper {
        width: 100%;
        max-width: none;
        padding: 40px 60px;
        flex: 1;
      }

      .assignment-title {
        font-size: 36px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 16px;
      }

      .assignment-meta {
        display: flex;
        gap: 24px;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 1px solid rgba(126, 162, 212, 0.2);
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #9CA3AF;
      }

      .meta-icon {
        color: var(--primary-color);
      }

      .assignment-section {
        margin-bottom: 32px;
      }

      .section-title {
        font-size: 14px !important;
        font-weight: 500 !important;
        color: #ffffff;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .section-content {
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 12px;
        padding: 24px;
        color: #E5E7EB;
        line-height: 1.6;
      }

      .file-attachment {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: rgba(126, 162, 212, 0.1);
        border: 1px solid rgba(126, 162, 212, 0.3);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .file-attachment:hover {
        background: rgba(126, 162, 212, 0.15);
        border-color: var(--primary-color);
      }

      .file-icon {
        width: 40px;
        height: 40px;
        background: var(--primary-color);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .file-info {
        flex: 1;
      }

      .file-name {
        font-size: 11px;
        font-weight: 500;
        color: #ffffff;
        margin-bottom: 3px;
      }

      .file-size {
        font-size: 9px;
        color: #9CA3AF;
      }

      .submit-section {
        background: rgba(58, 56, 56, 0.5);
        border: 2px dashed rgba(126, 162, 212, 0.3);
        border-radius: 12px;
        padding: 32px;
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .submit-section.drag-over {
        border-color: var(--primary-color);
        background: rgba(126, 162, 212, 0.1);
      }

      .submit-section.uploading {
        pointer-events: none;
        opacity: 0.7;
      }

      .upload-area {
        margin-bottom: 24px;
      }

      .upload-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 16px;
        background: rgba(126, 162, 212, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
      }

      .upload-text {
        font-size: 12px;
        color: #E5E7EB;
        margin-bottom: 6px;
      }

      .upload-hint {
        font-size: 10px;
        color: #9CA3AF;
      }

      .upload-btn {
        padding: 12px 32px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .upload-btn:hover {
        background: color-mix(in srgb, var(--primary-color) 80%, #000);
        transform: translateY(-1px);
      }

      .upload-btn.change-file {
        background: rgba(126, 162, 212, 0.2);
        border: 1px solid rgba(126, 162, 212, 0.5);
        color: var(--primary-color);
        font-size: 12px;
        padding: 8px 16px;
        margin-top: 8px;
      }

      .upload-btn.change-file:hover {
        background: rgba(126, 162, 212, 0.3);
        transform: none;
      }

      .assignment-actions {
        display: flex;
        gap: 16px;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
        justify-content: flex-end;
      }

      .btn {
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }

      .btn-primary {
        background: var(--primary-color);
        color: white;
      }

      .btn-primary:hover {
        background: var(--primary-color);
        opacity: 0.85;
      }

      .btn-primary:disabled {
        background: color-mix(in srgb, var(--primary-color) 50%, transparent);
        cursor: not-allowed;
        opacity: 0.6;
      }

      .btn-secondary {
        background: rgba(58, 56, 56, 0.5);
        color: #E5E7EB;
        border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
      }

      .btn-secondary:hover {
        background: rgba(58, 56, 56, 0.65);
        opacity: 1;
      }

      .upload-progress {
        width: 100%;
        background: rgba(58, 56, 56, 0.5);
        border-radius: 8px;
        height: 8px;
        margin-top: 16px;
        overflow: hidden;
      }

      .upload-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 85%, #000));
        transition: width 0.3s ease;
        border-radius: 8px;
      }

      .upload-status {
        margin-top: 16px;
        font-size: 14px;
        color: #E5E7EB;
      }

      .upload-status.success {
        color: #10B981;
      }

      .upload-status.error {
        color: #EF4444;
      }

      .upload-status.submitted {
        color: #10B981;
        border: 1px solid rgba(16, 185, 129, 0.3);
        background: rgba(16, 185, 129, 0.1);
        padding: 16px;
        border-radius: 8px;
        margin-top: 12px;
        line-height: 1.8;
      }

      .upload-status.submitted strong {
        color: #10B981;
      }

      .upload-status.submitted small {
        color: rgba(16, 185, 129, 0.8);
      }

      /* Toast Notifications */
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .toast {
        background: rgba(42, 42, 42, 0.95);
        border: 1px solid rgba(126, 162, 212, 0.3);
        border-radius: 12px;
        padding: 16px 20px;
        color: #111111;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .toast.show {
        transform: translateX(0);
        opacity: 1;
      }

      .toast.success {
        border-color: rgba(16, 185, 129, 0.5);
        background: rgba(16, 185, 129, 0.1);
      }

      .toast.error {
        border-color: rgba(239, 68, 68, 0.5);
        background: rgba(239, 68, 68, 0.1);
      }

      .toast.info {
        border-color: rgba(126, 162, 212, 0.5);
        background: rgba(126, 162, 212, 0.1);
      }

      .toast-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .toast-icon.success {
        color: #10B981;
      }

      .toast-icon.error {
        color: #EF4444;
      }

      .toast-icon.info {
        color: var(--primary-color);
      }

      .toast-content {
        flex: 1;
      }

      .toast-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .toast-message {
        font-size: 13px;
        color: #111111;
        line-height: 1.4;
      }

      .toast-close {
        width: 20px;
        height: 20px;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        transition: color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .toast-close:hover {
        color: rgba(255, 255, 255, 0.9);
      }
    </style>

    <div class="assignment-content-wrapper">
      <!-- Assignment Header -->
      <h1 class="assignment-title">${lesson.title || t('assignment.title')}</h1>

      ${lesson.duration ? `
      <div class="assignment-meta">
        <div class="meta-item">
          <svg class="meta-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span>${lesson.duration}</span>
        </div>
      </div>
      ` : ''}

      <!-- Instruction -->
      ${lesson.instructions ? `
      <div class="assignment-section">
        <h2 class="section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          ${t('assignment.instruction')}
        </h2>
        <div class="section-content">
          ${lesson.instructions}
        </div>
      </div>
      ` : ''}

      <!-- Attachments -->
      ${lesson.fileUrl ? `
      <div class="assignment-section">
        <h2 class="section-title">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
          </svg>
          ${t('assignment.attachments')}
        </h2>
        <div onclick="downloadFile('${lesson.fileUrl}', 'assignment_file')" class="file-attachment">
          <div class="file-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </div>
          <div class="file-info">
            <div class="file-name">${t('assignment.assignmentFile')}</div>
            <div class="file-size">${t('assignment.clickToDownload')}</div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
        </div>
      </div>
      ` : ''}

      <!-- Submit Section -->
      <div class="assignment-section">
        <h2 class="section-title">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          ${t('assignment.submitYourWork')}
        </h2>
        <div class="submit-section" id="submitSection" onclick="chooseFile()" ondragover="handleDragOver(event)" ondrop="handleDrop(event)" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)">
          <div class="upload-area">
            <div class="upload-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3"/>
              </svg>
            </div>
            <div class="upload-text" id="uploadText">${t('assignment.dragDropFile')}</div>
            <div class="upload-hint">${t('assignment.or')}</div>
          </div>
          <button class="upload-btn" onclick="chooseFile()">
            ${t('assignment.chooseFile')}
          </button>
          <input type="file" id="fileInput" style="display: none;" onchange="handleFileSelect(event)">
          <div class="upload-progress" id="uploadProgress" style="display: none;">
            <div class="upload-progress-bar" id="uploadProgressBar" style="width: 0%"></div>
          </div>
          <div class="upload-status" id="uploadStatus"></div>
        </div>
      </div>

      <!-- Actions -->
      <div class="assignment-actions">
        <button class="btn btn-primary" id="submitBtn" onclick="submitAssignment()" disabled>
          ${t('assignment.submitAssignment')}
        </button>
        <button class="btn btn-secondary" onclick="if(window.markCompleteAndGoNext && window.currentCourse && window.currentLesson) { window.markCompleteAndGoNext(window.currentCourse._id, window.currentLesson._id); } else { window.history.back(); }">
          ${t('assignment.nextLesson')}
        </button>
      </div>
    </div>

    <!-- Toast Container -->
    <div id="toastContainer" class="toast-container"></div>
  `;

  // Initialize all the assignment functionality
  await initializeAssignmentFunctionality(course, lesson);
  
  // Add language change listener for retranslation
  window.addEventListener('languageChanged', () => {
    // Re-render assignment content with new language
    renderAssignmentContent(contentArea, course, lesson);
  });
}

// Initialize assignment functionality (moved from main function)
async function initializeAssignmentFunctionality(course, lesson) {
  // All the assignment functionality code from the original function
  // (Toast system, file upload, submission logic, etc.)

  // Toast notification system (keep from original)
  window.showToast = function(title, message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;

    let iconSvg = '';
    switch(type) {
      case 'success':
        iconSvg = '<svg class="toast-icon success" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>';
        break;
      case 'error':
        iconSvg = '<svg class="toast-icon error" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>';
        break;
      default:
        iconSvg = '<svg class="toast-icon info" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>';
        break;
    }

    toast.innerHTML = iconSvg +
      '<div class="toast-content">' +
        '<div class="toast-title">' + title + '</div>' +
        (message ? '<div class="toast-message">' + message + '</div>' : '') +
      '</div>' +
      '<button class="toast-close" onclick="hideToast(this.parentElement)">' +
        '<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">' +
          '<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />' +
        '</svg>' +
      '</button>';

    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    if (duration > 0) {
      setTimeout(() => hideToast(toast), duration);
    }
  };

  window.hideToast = function(toast) {
    if (!toast) return;
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  };

  // Initialize all the assignment upload and submission logic from the original function
  // (File upload variables, drag and drop handlers, etc.)

  let uploadedFileUrl = null;
  let uploadedFileName = null;

  const assignmentKey = 'assignment_' + lesson._id + '_' + course._id;
  const submissionKey = 'submitted_' + lesson._id + '_' + course._id;

  // All the assignment functionality...
  // (Copy the rest of the functionality from the original loadAssignmentPlayer function)

  setTimeout(async () => {
    const hasBackendSubmission = await checkBackendSubmission();
    if (!hasBackendSubmission) {
      const isSubmitted = checkSubmissionStatus();
      if (!isSubmitted) {
        restorePreviousUpload();
      }
    }
  }, 100);

  // Copy all the remaining functionality from the original function
  function restorePreviousUpload() {
    try {
      const savedFile = localStorage.getItem(assignmentKey);
      if (savedFile) {
        const fileData = JSON.parse(savedFile);
        const uploadTime = new Date(fileData.uploadedAt);
        const now = new Date();
        const hoursSinceUpload = (now - uploadTime) / (1000 * 60 * 60);

        if (hoursSinceUpload < 24 && fileData.fileUrl && fileData.fileName) {
          uploadedFileUrl = fileData.fileUrl;
          uploadedFileName = fileData.fileName;

          const uploadText = document.getElementById('uploadText');
          const uploadStatus = document.getElementById('uploadStatus');
          const submitBtn = document.getElementById('submitBtn');
          const uploadProgress = document.getElementById('uploadProgress');
          const uploadProgressBar = document.getElementById('uploadProgressBar');

          if (uploadText) uploadText.textContent = 'Previously uploaded: ' + fileData.fileName;
          if (uploadStatus) {
            uploadStatus.textContent = 'File "' + fileData.fileName + '" ready for submission';
            uploadStatus.className = 'upload-status success';
          }
          if (submitBtn) submitBtn.disabled = false;
          if (uploadProgress) uploadProgress.style.display = 'block';
          if (uploadProgressBar) uploadProgressBar.style.width = '100%';

          showChangeFileButton();
          console.log('📁 Restored previous upload:', fileData.fileName);
        }
      }
    } catch (error) {
      console.error('Error restoring previous upload:', error);
      localStorage.removeItem(assignmentKey);
    }
  }

  function saveUploadedFile(fileUrl, fileName) {
    try {
      const fileData = {
        fileUrl: fileUrl,
        fileName: fileName,
        uploadedAt: new Date().toISOString(),
        lessonId: lesson._id,
        courseId: course._id
      };
      localStorage.setItem(assignmentKey, JSON.stringify(fileData));
      console.log('💾 Saved upload data for future sessions');
    } catch (error) {
      console.error('Error saving upload data:', error);
    }
  }

  function clearSavedFile() {
    try {
      localStorage.removeItem(assignmentKey);
      console.log('🗑️ Cleared saved upload data');
    } catch (error) {
      console.error('Error clearing upload data:', error);
    }
  }

  function showChangeFileButton() {
    const submitSection = document.getElementById('submitSection');
    if (!submitSection || document.getElementById('changeFileBtn')) return;

    const changeBtn = document.createElement('button');
    changeBtn.id = 'changeFileBtn';
    changeBtn.className = 'upload-btn change-file';
    changeBtn.textContent = 'Change File';
    changeBtn.onclick = function() {
      uploadedFileUrl = null;
      uploadedFileName = null;
      clearSavedFile();

      const uploadText = document.getElementById('uploadText');
      const uploadStatus = document.getElementById('uploadStatus');
      const submitBtn = document.getElementById('submitBtn');
      const uploadProgress = document.getElementById('uploadProgress');

      if (uploadText) uploadText.textContent = 'Drag and drop your file here';
      if (uploadStatus) {
        uploadStatus.textContent = '';
        uploadStatus.className = 'upload-status';
      }
      if (submitBtn) submitBtn.disabled = true;
      if (uploadProgress) uploadProgress.style.display = 'none';

      changeBtn.remove();
      chooseFile();
    };

    const uploadBtn = submitSection.querySelector('.upload-btn:not(.change-file)');
    if (uploadBtn && uploadBtn.parentNode) {
      uploadBtn.parentNode.insertBefore(changeBtn, uploadBtn.nextSibling);
    }
  }

  function checkSubmissionStatus() {
    try {
      const submissionData = localStorage.getItem(submissionKey);
      if (submissionData) {
        const submission = JSON.parse(submissionData);
        showSubmissionStatus(submission);
        return true;
      }
    } catch (error) {
      console.error('Error checking submission status:', error);
      localStorage.removeItem(submissionKey);
    }
    return false;
  }

  function showSubmissionStatus(submission) {
    const uploadText = document.getElementById('uploadText');
    const uploadStatus = document.getElementById('uploadStatus');
    const submitBtn = document.getElementById('submitBtn');
    const submitSection = document.getElementById('submitSection');

    if (uploadText) uploadText.textContent = 'Assignment already submitted';
    if (uploadStatus) {
      const submitTime = new Date(submission.submittedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      let statusHtml = '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><strong>Submitted:</strong></div>' +
        '<div style="margin-left: 26px;">' + submission.fileName + '<br>' +
        '<small>Submitted on ' + submitTime + '</small></div>';

      if (submission.status === 'graded' && submission.grade !== undefined) {
        let gradeColor = '#10B981';
        if (submission.grade < 60) {
          gradeColor = '#EF4444';
        } else if (submission.grade < 80) {
          gradeColor = '#F59E0B';
        }

        statusHtml += '<div style="text-align: center; margin-top: 20px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">' +
          '<div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + gradeColor + '" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg><strong style="font-size: 15px;">Grade</strong></div>' +
          '<div style="font-size: 32px; font-weight: 700; color: ' + gradeColor + ';">' + submission.grade + '%</div>' +
          '</div>';
      }

      if (submission.feedback) {
        statusHtml += '<div style="text-align: center; margin-top: 16px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">' +
          '<div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg><strong style="font-size: 15px;">Feedback</strong></div>' +
          '<div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6;">' + submission.feedback + '</div>' +
          '</div>';
      }

      uploadStatus.innerHTML = statusHtml;
      uploadStatus.className = 'upload-status submitted';
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Already Submitted';
    }
    if (submitSection) {
      submitSection.style.pointerEvents = 'none';
      submitSection.style.opacity = '0.7';
    }

    console.log('📋 Assignment already submitted:', submission.fileName);
    syncAssignmentCompletion(course, lesson);
  }

  function markAsSubmitted(fileUrl, fileName) {
    try {
      const submissionData = {
        fileUrl: fileUrl,
        fileName: fileName,
        submittedAt: new Date().toISOString(),
        lessonId: lesson._id,
        courseId: course._id
      };
      localStorage.setItem(submissionKey, JSON.stringify(submissionData));
      console.log('✅ Marked assignment as submitted');
    } catch (error) {
      console.error('Error marking submission:', error);
    }
  }

  async function checkBackendSubmission() {
    try {
      const landingUser = JSON.parse(sessionStorage.getItem('landingUser') || '{}');
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

      console.log('🔍 Checking backend for existing submission...');

      const response = await fetch(
        `${apiBaseUrl}/submissions/student/${landingUser._id}/lesson/${lesson._id}`
      );

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.submission) {
          console.log('✅ Found existing submission in DB:', result.submission);

          const submission = result.submission;
          showSubmissionStatus({
            fileUrl: submission.fileUrl,
            fileName: submission.fileName,
            submittedAt: submission.submittedAt,
            status: submission.status,
            grade: submission.grade,
            feedback: submission.feedback
          });

          return true;
        }
      }

      console.log('📭 No submission found in DB');
      return false;

    } catch (error) {
      console.error('Error checking backend submission:', error);
      return false;
    }
  }

  // Drag and drop handlers
  window.handleDragOver = function(event) {
    event.preventDefault();
    event.stopPropagation();
  };

  window.handleDragEnter = function(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('submitSection').classList.add('drag-over');
  };

  window.handleDragLeave = function(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!event.currentTarget.contains(event.relatedTarget)) {
      document.getElementById('submitSection').classList.remove('drag-over');
    }
  };

  window.handleDrop = function(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('submitSection').classList.remove('drag-over');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  window.chooseFile = function() {
    document.getElementById('fileInput').click();
  };

  window.handleFileSelect = function(event) {
    const file = event.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  window.uploadFile = async function(file) {
    const submitSection = document.getElementById('submitSection');
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadProgressBar = document.getElementById('uploadProgressBar');
    const uploadStatus = document.getElementById('uploadStatus');
    const uploadText = document.getElementById('uploadText');
    const submitBtn = document.getElementById('submitBtn');

    submitSection.classList.add('uploading');
    uploadProgress.style.display = 'block';
    uploadStatus.textContent = 'Uploading file...';
    uploadStatus.className = 'upload-status';
    uploadProgressBar.style.width = '0%';
    submitBtn.disabled = true;

    try {
      const landingUser = JSON.parse(sessionStorage.getItem('landingUser') || '{}');

      console.log('🔐 Token debug:', {
        hasUser: !!landingUser,
        hasToken: !!landingUser.token,
        tokenPreview: landingUser.token ? landingUser.token.substring(0, 20) + '...' : 'none'
      });

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          uploadProgressBar.style.width = percentComplete + '%';
        }
      };

      xhr.onload = function() {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            uploadedFileUrl = response.url;
            uploadedFileName = file.name;

            uploadStatus.textContent = 'File "' + file.name + '" uploaded successfully!';
            uploadStatus.className = 'upload-status success';
            uploadText.textContent = 'Selected: ' + file.name;
            submitBtn.disabled = false;
            uploadProgressBar.style.width = '100%';

            saveUploadedFile(response.url, file.name);
            showChangeFileButton();
            showToast('File Uploaded!', 'Your file has been uploaded successfully. You can now submit the assignment.', 'success', 3000);
          } else {
            throw new Error(response.message || 'Upload failed');
          }
        } else if (xhr.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (xhr.status === 413) {
          throw new Error('File too large. Please choose a smaller file.');
        } else {
          throw new Error('Upload failed (Status: ' + xhr.status + ')');
        }
        submitSection.classList.remove('uploading');
      };

      xhr.onerror = function() {
        submitSection.classList.remove('uploading');
        uploadStatus.textContent = 'Upload failed. Please try again.';
        uploadStatus.className = 'upload-status error';
        uploadProgress.style.display = 'none';

        showToast('Upload Failed', 'Failed to upload file. Please check your connection and try again.', 'error', 5000);
      };

      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
      const uploadUrl = `${apiBaseUrl}/upload/document`;

      xhr.open('POST', uploadUrl);

      if (landingUser.token) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + landingUser.token);
      }

      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      submitSection.classList.remove('uploading');
      uploadStatus.textContent = 'Upload failed. Please try again.';
      uploadStatus.className = 'upload-status error';
      uploadProgress.style.display = 'none';

      showToast('Upload Error', 'An unexpected error occurred during upload. Please try again.', 'error', 5000);
    }
  };

  window.submitAssignment = async function() {
    if (!uploadedFileUrl) {
      showToast('Upload Required', 'Please upload a file before submitting the assignment.', 'error', 4000);
      return;
    }

    try {
      const landingUser = JSON.parse(sessionStorage.getItem('landingUser') || '{}');
      const submitBtn = document.getElementById('submitBtn');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      const submissionData = {
        courseId: course._id,
        lessonId: lesson._id,
        studentId: landingUser._id,
        fileUrl: uploadedFileUrl,
        fileName: uploadedFileName,
        lessonTitle: lesson.title,
        instructions: lesson.instructions
      };

      console.log('📤 Submitting assignment:', {
        courseId: submissionData.courseId,
        lessonId: submissionData.lessonId,
        studentId: submissionData.studentId,
        fileName: submissionData.fileName,
        lessonTitle: submissionData.lessonTitle,
      });

      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
      const url = `${apiBaseUrl}/submissions/lesson-assignment`;
      console.log('🌐 Submission URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      console.log('📥 Response status:', response.status, response.statusText);

      const result = await response.json();
      console.log('📦 Response data:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to submit assignment');
      }

      markAsSubmitted(uploadedFileUrl, uploadedFileName);
      clearSavedFile();
      syncAssignmentCompletion(course, lesson);

      showToast('Assignment Submitted!', 'Your submission has been recorded successfully.', 'success', 3000);
      console.log('✅ Assignment submitted successfully!');

      setTimeout(() => {
        window.history.back();
      }, 2000);

    } catch (error) {
      console.error('❌ Submission error:', error);
      showToast('Submission Failed', 'Failed to submit assignment: ' + error.message, 'error', 5000);

      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Assignment';
    }
  };

  window.downloadFile = function(url, filename) {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'assignment_file';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };
}
