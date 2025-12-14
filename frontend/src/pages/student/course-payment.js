// Course payment page for paid courses
import { t } from '../../utils/i18n.js';
import { showSuccessToast, showErrorToast } from '../../utils/toast.js';

export async function initCoursePaymentPage(courseId) {
  console.log('💳 Loading course payment page for:', courseId);

  const appElement = document.querySelector('#app');
  if (!appElement) return;

  // Hide existing headers and clean up body
  const existingHeaders = document.querySelectorAll('.mobile-header, .desktop-header, .figma-header, .landing-header');
  existingHeaders.forEach(header => {
    header.style.display = 'none';
  });
  
  // Clean up body styles
  document.body.style.margin = '0';
  document.body.style.padding = '0';



  // Show loading
  appElement.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #232323;">
      <div style="color: var(--primary-color); font-size: 18px;">Loading course details...</div>
    </div>
  `;

  try {
    // Fetch course data
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const response = await fetch(`${apiBaseUrl}/courses/${courseId}`);
    const result = await response.json();

    if (!result.success || !result.course) {
      throw new Error('Course not found');
    }

    const course = result.course;

    // Check if student already submitted payment
    const landingUser = JSON.parse(sessionStorage.getItem('landingUser') || '{}');
    let paymentStatus = null;
    
    if (landingUser._id) {
      try {
        const statusResponse = await fetch(`${apiBaseUrl}/payments/student/${landingUser._id}/course/${courseId}`);
        const statusResult = await statusResponse.json();
        if (statusResult.success && statusResult.payment) {
          paymentStatus = statusResult.payment;
        }
      } catch (error) {
        console.log('No existing payment found');
      }
    }

    // Apply teacher's primary color from landing page
    try {
      const teacherId = course.teacher._id || course.teacher;
      const landingResponse = await fetch(`${apiBaseUrl}/landing/${teacherId}`);
      const landingResult = await landingResponse.json();
      
      if (landingResult.success && landingResult.landing && landingResult.landing.primaryColor) {
        const { applyPrimaryColor } = await import('../../utils/theme.js');
        applyPrimaryColor(landingResult.landing.primaryColor);
      }
    } catch (error) {
      console.error('Error loading teacher theme:', error);
    }

    // Render payment page based on status
    if (paymentStatus && paymentStatus.status !== 'rejected') {
      // Show already submitted status (pending or approved)
      appElement.innerHTML = `
        <style>
          /* Hide all existing headers */
          .mobile-header,
          .desktop-header,
          .figma-header,
          .landing-header {
            display: none !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          .payment-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .payment-container {
            background: rgba(42, 42, 42, 0.95);
            border: 1px solid var(--primary-border);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            backdrop-filter: blur(10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            text-align: center;
          }

          .status-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 24px;
            color: #FBB936;
          }

          .status-title {
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 16px;
          }

          .status-message {
            font-size: 16px;
            color: #9ca3af;
            line-height: 1.6;
            margin-bottom: 32px;
          }

          .course-info {
            background: rgba(42, 42, 42, 0.5);
            border: 1px solid var(--primary-border);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 32px;
          }

          .course-name {
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 8px;
          }

          .course-price {
            font-size: 20px;
            font-weight: 700;
            color: var(--primary-color);
          }

          .back-btn {
            background: var(--primary-color);
            border: none;
            color: white;
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .back-btn:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px var(--primary-shadow);
          }

          @media (max-width: 768px) {
            .payment-container {
              padding: 30px 20px;
              margin: 20px;
            }

            .status-title {
              font-size: 24px;
            }
          }
        </style>

        <div class="payment-page">
          <div class="payment-container">
            <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>

            <h1 class="status-title">${t('payment.alreadySubmitted')}</h1>
            <p class="status-message">${t('payment.paymentUnderReview')}</p>

            <div class="course-info">
              <div class="course-name">${course.title}</div>
              <div class="course-price">${course.price ? `${course.price.toLocaleString()} UZS` : 'Free'}</div>
            </div>

            <button class="back-btn" onclick="goBackToCourse()">
              ${t('common.back')}
            </button>
          </div>
        </div>
      `;
    } else if (paymentStatus && paymentStatus.status === 'rejected') {
      // Show rejected payment status with option to resubmit
      appElement.innerHTML = `
        <style>
          /* Hide all existing headers */
          .mobile-header,
          .desktop-header,
          .figma-header,
          .landing-header {
            display: none !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          .payment-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .payment-container {
            background: rgba(42, 42, 42, 0.95);
            border: 1px solid var(--primary-border);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            backdrop-filter: blur(10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            text-align: center;
          }

          .status-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 24px;
            color: #EF4444;
          }

          .status-title {
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 16px;
          }

          .status-message {
            font-size: 16px;
            color: #9ca3af;
            line-height: 1.6;
            margin-bottom: 24px;
          }

          .rejection-reason {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 32px;
          }

          .rejection-reason-title {
            font-size: 14px;
            font-weight: 600;
            color: #EF4444;
            margin-bottom: 8px;
          }

          .rejection-reason-text {
            font-size: 14px;
            color: #FCA5A5;
            line-height: 1.4;
          }

          .course-info {
            background: rgba(42, 42, 42, 0.5);
            border: 1px solid var(--primary-border);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 32px;
          }

          .course-name {
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 8px;
          }

          .course-price {
            font-size: 20px;
            font-weight: 700;
            color: var(--primary-color);
          }

          .action-buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
          }

          .retry-btn {
            background: var(--primary-color);
            border: none;
            color: white;
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .retry-btn:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px var(--primary-shadow);
          }

          .back-btn {
            background: transparent;
            border: 1px solid var(--primary-border);
            color: #9ca3af;
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .back-btn:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
          }

          @media (max-width: 768px) {
            .payment-container {
              padding: 30px 20px;
              margin: 20px;
            }

            .status-title {
              font-size: 24px;
            }

            .action-buttons {
              flex-direction: column;
            }
          }
        </style>

        <div class="payment-page">
          <div class="payment-container">
            <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>

            <h1 class="status-title">Payment Rejected</h1>
            <p class="status-message">Your payment was rejected by the teacher. You can submit a new payment below.</p>

            ${paymentStatus.rejectionReason ? `
              <div class="rejection-reason">
                <div class="rejection-reason-title">Rejection Reason:</div>
                <div class="rejection-reason-text">${paymentStatus.rejectionReason}</div>
              </div>
            ` : ''}

            <div class="course-info">
              <div class="course-name">${course.title}</div>
              <div class="course-price">${course.price ? `${course.price.toLocaleString()} UZS` : 'Free'}</div>
            </div>

            <div class="action-buttons">
              <button class="back-btn" onclick="goBackToCourse()">
                ${t('common.back')}
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      // Show normal payment form
      appElement.innerHTML = `
      <style>
        /* Hide all existing headers */
        .mobile-header,
        .desktop-header,
        .figma-header,
        .landing-header {
          display: none !important;
        }

        body {
          margin: 0 !important;
          padding: 0 !important;
        }

        .payment-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .payment-container {
          background: rgba(42, 42, 42, 0.95);
          border: 1px solid var(--primary-border);
          border-radius: 20px;
          padding: 30px 40px;
          max-width: 800px;
          width: 100%;
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .payment-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .payment-title {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .payment-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 32px;
        }

        .course-info {
          background: rgba(42, 42, 42, 0.95);
          border: 1px solid var(--primary-border);
          border-radius: 12px;
          padding: 24px;
        }

        .course-name {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 12px;
        }

        .course-price {
          font-size: 28px;
          font-weight: 700;
          color: var(--primary-color);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .upload-section {
          background: rgba(42, 42, 42, 0.5);
          border: 1px solid var(--primary-border);
          border-radius: 12px;
          padding: 24px;
        }

        .upload-label {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
          display: block;
        }

        .upload-desc {
          font-size: 14px;
          color: #9ca3af;
          margin-bottom: 16px;
        }

        .file-upload-area {
          border: 2px dashed var(--primary-border);
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: var(--primary-light);
        }

        .file-upload-area:hover {
          border-color: var(--primary-color);
          background: var(--primary-light-hover);
        }

        .file-upload-area.has-file {
          border-color: #10B981;
          background: rgba(16, 185, 129, 0.1);
        }

        .upload-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
          color: var(--primary-color);
        }

        .upload-text {
          font-size: 16px;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .upload-subtext {
          font-size: 14px;
          color: #9ca3af;
        }

        .file-info {
          display: none;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid #10B981;
          border-radius: 8px;
          margin-top: 16px;
        }

        .file-info.show {
          display: flex;
        }

        .pending-message {
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
          text-align: center;
        }

        .pending-text {
          color: #FBB936;
          font-size: 16px;
          line-height: 1.5;
        }

        .submit-btn {
          width: 100%;
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px var(--primary-shadow);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .back-btn {
          background: transparent;
          border: 1px solid var(--primary-border);
          color: #9ca3af;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 20px;
        }

        .back-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        @media (max-width: 768px) {
          .payment-container {
            padding: 30px 20px;
            margin: 20px;
          }

          .payment-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .payment-title {
            font-size: 24px;
          }

          .course-price {
            font-size: 24px;
          }
        }
      </style>

      <div class="payment-page">
        <div class="payment-container">
          <button class="back-btn" onclick="goBackToCourse()">
            ← ${t('common.back')}
          </button>

          <div class="payment-header">
            <h1 class="payment-title">${t('payment.title')}</h1>
          </div>

          <div class="payment-content">
            <div class="course-info">
              <div style="margin-bottom: 16px;">
                <div style="font-size: 14px; color: #9ca3af; margin-bottom: 4px;">${t('payment.courseName')}</div>
                <div class="course-name">${course.title}</div>
              </div>
              <div>
                <div style="font-size: 14px; color: #9ca3af; margin-bottom: 4px;">${t('payment.coursePrice')}</div>
                <div class="course-price">
                  ${course.price ? `${course.price.toLocaleString()} UZS` : 'Free'}
                </div>
              </div>
            </div>

            <div class="upload-section">
            <label class="upload-label">${t('payment.uploadCheck')}</label>
            <div class="upload-desc">${t('payment.uploadCheckDesc')}</div>
            
            <div class="file-upload-area" id="uploadArea" onclick="document.getElementById('fileInput').click()">
              <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <div class="upload-text">${t('payment.selectFile')}</div>
              <div class="upload-subtext">JPG, PNG, GIF (max 5MB)</div>
            </div>

            <div class="file-info" id="fileInfo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
              </svg>
              <span id="fileName">${t('payment.fileSelected')}</span>
            </div>

            <input type="file" id="fileInput" accept="image/*" style="display: none;" onchange="handleFileSelect(event)">
            </div>
          </div>

          <div class="pending-message">
            <div class="pending-text">${t('payment.pendingMessage')}</div>
          </div>

          <button class="submit-btn" id="submitBtn" onclick="submitPayment()" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
            ${t('payment.submitPayment')}
          </button>
        </div>
      </div>
    `;

    }

    // Store course data globally
    window.currentCourse = course;
    window.selectedFile = null;

  } catch (error) {
    console.error('Error loading course payment page:', error);
    appElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #232323; color: #ef4444; text-align: center;">
        <div>
          <h2>Error Loading Course</h2>
          <p>Please try again later</p>
          <button onclick="window.history.back()" style="margin-top: 20px; padding: 10px 20px; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer;">
            Go Back
          </button>
        </div>
      </div>
    `;
  }
}

// Handle file selection
window.handleFileSelect = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    showErrorToast(t('payment.invalidFile'));
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showErrorToast(t('payment.fileTooLarge'));
    return;
  }

  // Update UI
  const uploadArea = document.getElementById('uploadArea');
  const fileInfo = document.getElementById('fileInfo');
  const fileName = document.getElementById('fileName');
  const submitBtn = document.getElementById('submitBtn');

  uploadArea.classList.add('has-file');
  fileInfo.classList.add('show');
  fileName.textContent = file.name;
  submitBtn.disabled = false;

  // Store file
  window.selectedFile = file;
};

// Submit payment
window.submitPayment = async function() {
  if (!window.selectedFile || !window.currentCourse) {
    showErrorToast(t('payment.submissionError'));
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      <path d="M9 12l2 2 4-4"></path>
    </svg>
    Uploading...
  `;

  try {
    // Get student ID
    const landingUser = JSON.parse(sessionStorage.getItem('landingUser') || '{}');
    if (!landingUser._id) {
      throw new Error('Student not found');
    }

    // Upload file to R2 using document endpoint
    const formData = new FormData();
    formData.append('file', window.selectedFile);

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
    const uploadResponse = await fetch(`${apiBaseUrl}/upload/document`, {
      method: 'POST',
      body: formData
    });

    const uploadResult = await uploadResponse.json();
    if (!uploadResult.success) {
      throw new Error('File upload failed');
    }

    // Submit payment
    const paymentData = {
      studentId: landingUser._id,
      courseId: window.currentCourse._id,
      teacherId: window.currentCourse.teacher._id || window.currentCourse.teacher,
      amount: window.currentCourse.price || 0,
      checkImageUrl: uploadResult.url
    };

    const paymentResponse = await fetch(`${apiBaseUrl}/payments/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const paymentResult = await paymentResponse.json();
    if (!paymentResult.success) {
      throw new Error(paymentResult.message || 'Payment submission failed');
    }

    showSuccessToast(t('payment.submissionSuccess'));
    
    // Redirect back to landing student dashboard after delay
    setTimeout(() => {
      goBackToCourse();
    }, 2000);

  } catch (error) {
    console.error('Payment submission error:', error);
    showErrorToast(t('payment.submissionError'));
    
    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22,4 12,14.01 9,11.01"></polyline>
      </svg>
      ${t('payment.submitPayment')}
    `;
  }
};

// Go back to landing student dashboard
window.goBackToCourse = function() {
  // Get teacher ID from current course or URL
  const teacherId = window.currentCourse?.teacher?._id || window.currentCourse?.teacher;
  
  if (teacherId) {
    // Navigate to landing student dashboard with teacher ID
    import('../../utils/router.js').then(({ router }) => {
      router.navigate(`/teacher/${teacherId}/student-dashboard`);
    }).catch(() => {
      window.location.href = `/teacher/${teacherId}/student-dashboard`;
    });
  } else {
    // Fallback to regular student dashboard
    import('../../utils/router.js').then(({ router }) => {
      router.navigate('/student-dashboard');
    }).catch(() => {
      window.location.href = '/student-dashboard';
    });
  }
};

// Add spin animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);