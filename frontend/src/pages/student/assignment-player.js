// Assignment player page
export async function loadAssignmentPlayer(course, lesson, sidebarHtml) {
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
        color: #7EA2D4;
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
        background: rgba(126, 162, 212, 0.1);
        color: #ffffff;
        border-color: #7ea2d4;
      }

      .logout-btn {
        width: auto !important;
        padding: 0 16px !important;
        gap: 8px;
        border-color: #7ea2d4 !important;
        color: #7ea2d4 !important;
      }

      .logout-text {
        font-size: 14px;
        font-weight: 500;
        color: #7ea2d4;
      }

      /* Layout */
      .assignment-layout {
        display: flex;
        height: calc(100vh - 81px);
        overflow: hidden;
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
        color: #7ea2d4;
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
        background: rgba(126, 162, 212, 0.2);
        border-left-color: #7ea2d4;
      }

      .sidebar-lesson-icon {
        color: #7ea2d4;
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

      .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #9CA3AF;
      }

      .meta-icon {
        color: #7ea2d4;
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
        background: rgba(126, 162, 212, 0.15);
        border-color: #7ea2d4;
      }

      .file-icon {
        width: 40px;
        height: 40px;
        background: #7ea2d4;
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
        border-color: #7ea2d4;
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
        color: #7ea2d4;
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
        background: #7ea2d4;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .upload-btn:hover {
        background: #6b8fc4;
        transform: translateY(-1px);
      }

      .upload-btn.change-file {
        background: rgba(126, 162, 212, 0.2);
        border: 1px solid rgba(126, 162, 212, 0.5);
        color: #7ea2d4;
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
        border-top: 1px solid rgba(126, 162, 212, 0.2);
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
        background: #7ea2d4;
        color: white;
      }

      .btn-primary:hover {
        background: #6b8fc4;
      }

      .btn-primary:disabled {
        background: rgba(126, 162, 212, 0.5);
        cursor: not-allowed;
        opacity: 0.6;
      }

      .btn-secondary {
        background: rgba(58, 56, 56, 0.5);
        color: #E5E7EB;
        border: 1px solid rgba(126, 162, 212, 0.2);
      }

      .btn-secondary:hover {
        background: rgba(126, 162, 212, 0.1);
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
        background: linear-gradient(90deg, #7ea2d4, #6b8fc4);
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
        padding: 12px;
        border-radius: 8px;
        margin-top: 12px;
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
        color: #ffffff;
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
        color: #7ea2d4;
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
        color: rgba(255, 255, 255, 0.8);
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
        <button class="icon-btn logout-btn" onclick="handleLogout()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span class="logout-text">Log out</span>
        </button>
      </div>
    </header>

    <!-- Layout -->
    <div class="assignment-layout">
      <!-- Sticky Sidebar -->
      ${sidebarHtml}

      <!-- Main Content -->
      <div class="assignment-content">
        <div class="assignment-container">
          <!-- Assignment Header -->
          <h1 class="assignment-title">${lesson.title || 'Assignment'}</h1>
          
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
              Instruction
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
              Attachments
            </h2>
            <div onclick="downloadFile('${lesson.fileUrl}', 'assignment_file')" class="file-attachment">
              <div class="file-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <div class="file-info">
                <div class="file-name">Assignment File</div>
                <div class="file-size">Click to download</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7ea2d4" stroke-width="2">
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
              Submit Your Work
            </h2>
            <div class="submit-section" id="submitSection" onclick="chooseFile()" ondragover="handleDragOver(event)" ondrop="handleDrop(event)" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)">
              <div class="upload-area">
                <div class="upload-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3"/>
                  </svg>
                </div>
                <div class="upload-text" id="uploadText">Drag and drop your file here</div>
                <div class="upload-hint">or</div>
              </div>
              <button class="upload-btn" onclick="chooseFile()">
                Choose File
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
              Submit Assignment
            </button>
            <button class="btn btn-secondary" onclick="window.history.back()">
              Back to Course
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

          if (uploadText) uploadText.textContent = 'Previously uploaded: ' + fileData.fileName;
          if (uploadStatus) {
            uploadStatus.textContent = 'File "' + fileData.fileName + '" ready for submission';
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
    changeBtn.textContent = 'Change File';
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
      uploadStatus.innerHTML =
        '<strong>✅ Submitted:</strong> ' + submission.fileName + '<br>' +
        '<small>Submitted on ' + submitTime + '</small>';
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

  // Check submission status first, then restore upload if not submitted
  setTimeout(() => {
    const isSubmitted = checkSubmissionStatus();
    if (!isSubmitted) {
      restorePreviousUpload();
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

      // Send request to upload endpoint
      xhr.open('POST', 'http://localhost:8001/api/upload/document');

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

      // For now, we'll create a simple submission record
      // In a real system, this would find or create a proper assignment record
      const submissionData = {
        courseId: course._id,
        lessonId: lesson._id,
        studentId: landingUser._id,
        fileUrl: uploadedFileUrl,
        fileName: uploadedFileName,
        submittedAt: new Date().toISOString(),
        lessonTitle: lesson.title,
        instructions: lesson.instructions
      };

      // For now, let's store this in session storage and show success
      // In production, this should go to a proper submission endpoint
      const existingSubmissions = JSON.parse(sessionStorage.getItem('assignmentSubmissions') || '[]');
      existingSubmissions.push(submissionData);
      sessionStorage.setItem('assignmentSubmissions', JSON.stringify(existingSubmissions));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mark as submitted and clear saved file data
      markAsSubmitted(uploadedFileUrl, uploadedFileName);
      clearSavedFile();

      showToast('Assignment Submitted!', 'Your submission has been recorded successfully.', 'success', 3000);
      console.log('Assignment submitted:', submissionData);

      // Redirect back to course after showing toast
      setTimeout(() => {
        window.history.back();
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error);
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
        // Load video player
        window.location.href = '#/course/' + course._id + '/lesson/' + lessonId;
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
          const { loadAssignmentPlayer } = await import('./assignment-player.js');
          await loadAssignmentPlayer(course, selectedLesson, sidebarHtml);
        } else if (selectedLesson.type === 'file') {
          const { loadFilePlayer } = await import('./file-player.js');
          await loadFilePlayer(course, selectedLesson, sidebarHtml);
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
