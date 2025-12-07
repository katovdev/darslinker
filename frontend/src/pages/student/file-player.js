// File player page
export async function loadFilePlayer(course, lesson, sidebarHtml) {
  console.log('📎 Loading file player:', lesson.title);

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
      .file-header {
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
      .file-layout {
        display: flex;
        height: calc(100vh - 81px);
        overflow: hidden;
      }

      /* Sticky Sidebar */
      .file-sidebar {
        width: 320px;
        background: #2a2a2a;
        border-right: 1px solid rgba(126, 162, 212, 0.15);
        overflow-y: auto;
        flex-shrink: 0;
        position: sticky;
        top: 81px;
        height: calc(100vh - 81px);
      }

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

      .file-sidebar::-webkit-scrollbar {
        width: 6px;
      }

      .file-sidebar::-webkit-scrollbar-thumb {
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
      .file-content {
        flex: 1;
        overflow-y: auto;
        padding: 40px 60px;
        background: #1a1a1a;
      }

      .file-content::-webkit-scrollbar {
        width: 8px;
      }

      .file-content::-webkit-scrollbar-thumb {
        background: rgba(126, 162, 212, 0.3);
        border-radius: 4px;
      }

      .file-container {
        max-width: 900px;
        margin: 0 auto;
      }

      /* File Header */
      .file-title {
        font-size: 36px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 16px;
      }

      .file-meta {
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

      /* File Section */
      .file-section {
        margin-bottom: 32px;
      }

      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .section-content {
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 12px;
        padding: 24px;
        color: #E5E7EB;
        line-height: 1.6;
      }

      /* File Download Card */
      .file-download-card {
        background: linear-gradient(135deg, rgba(126, 162, 212, 0.1), rgba(126, 162, 212, 0.05));
        border: 2px solid rgba(126, 162, 212, 0.3);
        border-radius: 16px;
        padding: 32px;
        text-align: center;
        transition: all 0.3s ease;
      }

      .file-download-card:hover {
        border-color: #7ea2d4;
        background: linear-gradient(135deg, rgba(126, 162, 212, 0.15), rgba(126, 162, 212, 0.08));
        transform: translateY(-2px);
      }

      .file-icon-large {
        width: 80px;
        height: 80px;
        margin: 0 auto 24px;
        background: linear-gradient(135deg, #7ea2d4, #6b8fc4);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 8px 24px rgba(126, 162, 212, 0.3);
      }

      .file-info-large {
        margin-bottom: 24px;
      }

      .file-name-large {
        font-size: 20px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 8px;
      }

      .file-details {
        font-size: 14px;
        color: #9CA3AF;
        margin-bottom: 4px;
      }

      .download-btn {
        background: linear-gradient(135deg, #7ea2d4, #6b8fc4);
        color: white;
        border: none;
        padding: 16px 32px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 16px rgba(126, 162, 212, 0.3);
      }

      .download-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(126, 162, 212, 0.4);
      }

      .download-btn:active {
        transform: translateY(0);
      }


      /* File Type Icons */
      .file-type-pdf { background: linear-gradient(135deg, #e53e3e, #c53030); }
      .file-type-doc { background: linear-gradient(135deg, #3182ce, #2b77cb); }
      .file-type-image { background: linear-gradient(135deg, #38a169, #2f855a); }
      .file-type-zip { background: linear-gradient(135deg, #d69e2e, #b7791f); }
      .file-type-default { background: linear-gradient(135deg, #7ea2d4, #6b8fc4); }
    </style>

    <!-- Header -->
    <header class="file-header">
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
    <div class="file-layout">
      <!-- Sticky Sidebar -->
      ${sidebarHtml}

      <!-- Main Content -->
      <div class="file-content">
        <div class="file-container">
          <!-- File Header -->
          <h1 class="file-title">${lesson.title || 'File Resource'}</h1>

          <div class="file-meta">
            <div class="meta-item">
              <svg class="meta-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
              <span>File</span>
            </div>
          </div>

          <!-- Description -->
          ${lesson.description ? `
          <div class="file-section">
            <h2 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              About This File
            </h2>
            <div class="section-content">
              ${lesson.description}
            </div>
          </div>
          ` : ''}

          <!-- File Download -->
          ${lesson.fileUrl ? `
          <div class="file-section">
            <h2 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 002-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/>
              </svg>
              Download File
            </h2>
            <div class="file-download-card" onclick="downloadFile('${lesson.fileUrl}', getFileName('${lesson.fileUrl}', '${lesson.title}'))">
              <div class="file-icon-large" id="fileIconLarge">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <div class="file-info-large">
                <div class="file-name-large" id="fileName">${lesson.title || 'Download File'}</div>
                <div class="file-details" id="fileType">Click to download</div>
                <div class="file-details" id="fileSize">File available for download</div>
              </div>
              <button class="download-btn" onclick="event.stopPropagation(); downloadFile('${lesson.fileUrl}', getFileName('${lesson.fileUrl}', '${lesson.title}'))">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 002-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/>
                </svg>
                Download File
              </button>
            </div>
          </div>
          ` : ''}

        </div>
      </div>
    </div>
  `;

  // Set file type and icon based on URL
  setTimeout(() => {
    if (lesson.fileUrl) {
      const fileExtension = getFileExtension(lesson.fileUrl);
      const fileIconLarge = document.getElementById('fileIconLarge');
      const fileType = document.getElementById('fileType');

      if (fileIconLarge && fileType) {
        const { icon, type, className } = getFileTypeInfo(fileExtension);
        fileIconLarge.innerHTML = icon;
        fileIconLarge.className = 'file-icon-large ' + className;
        fileType.textContent = type + ' file';
      }
    }
  }, 100);

  // Download file handler
  window.downloadFile = function(url, filename) {
    try {
      // Create download link directly (bypasses CORS)
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'downloaded_file';
      link.target = '_blank';
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

  // Get file name from URL or title
  window.getFileName = function(url, title) {
    try {
      const urlPath = new URL(url).pathname;
      const fileName = urlPath.split('/').pop();
      if (fileName && fileName.includes('.')) {
        return fileName;
      }
    } catch (error) {
      console.log('Could not extract filename from URL');
    }

    // Fallback to title with generic extension
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    return cleanTitle || 'download';
  };

  // Get file extension
  function getFileExtension(url) {
    try {
      const urlPath = new URL(url).pathname;
      const fileName = urlPath.split('/').pop();
      const extension = fileName.split('.').pop().toLowerCase();
      return extension;
    } catch (error) {
      return 'file';
    }
  }

  // Get file type info (icon, type, className)
  function getFileTypeInfo(extension) {
    const fileTypes = {
      pdf: {
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/><path d="M14 3v4a1 1 0 001 1h4"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="6" font-weight="bold">PDF</text></svg>',
        type: 'PDF',
        className: 'file-type-pdf'
      },
      doc: {
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/><path d="M14 3v4a1 1 0 001 1h4"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="6" font-weight="bold">DOC</text></svg>',
        type: 'Word Document',
        className: 'file-type-doc'
      },
      docx: {
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/><path d="M14 3v4a1 1 0 001 1h4"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="5" font-weight="bold">DOCX</text></svg>',
        type: 'Word Document',
        className: 'file-type-doc'
      },
      jpg: {
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 00-2.828 0L6 21"/></svg>',
        type: 'Image',
        className: 'file-type-image'
      },
      png: {
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 00-2.828 0L6 21"/></svg>',
        type: 'Image',
        className: 'file-type-image'
      },
      zip: {
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M16 22H8c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2z"/><path d="M12 6h2v2h-2V6zM10 8h2v2h-2V8zM12 10h2v2h-2v-2zM10 12h2v2h-2v-2z"/></svg>',
        type: 'Archive',
        className: 'file-type-zip'
      }
    };

    return fileTypes[extension] || {
      icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
      type: 'File',
      className: 'file-type-default'
    };
  }


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

  // Module toggle function
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