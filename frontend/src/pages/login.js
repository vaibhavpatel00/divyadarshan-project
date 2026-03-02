import { sendOtp, verifyOtp, isLoggedIn } from '../api.js';

export function renderLogin() {
  if (isLoggedIn()) {
    window.location.hash = '#/';
    return '<div class="container" style="padding-top:120px;text-align:center;"><p>Redirecting...</p></div>';
  }

  return `
    <div class="auth-page">
      <div class="auth-container animate-fade-in-up">
        <div class="auth-header">
          <div style="font-size:48px;margin-bottom:12px;">🛕</div>
          <h1 id="authTitle">Welcome</h1>
          <p id="authSubtitle">Login with your Phone or Email</p>
        </div>

        <div class="auth-form" id="authForm">
          <div class="auth-error" id="authError"></div>

          <!-- Step 1: Identifier Input -->
          <div id="stepRequestOtp">
            <div class="input-group">
              <label class="input-label">Email or Phone Number</label>
              <input type="text" class="input-field" id="authIdentifier" placeholder="Enter email or 10-digit phone" />
            </div>
            
            <button class="btn btn-primary btn-lg" style="width:100%;margin-top:10px;" id="btnRequestOtp" onclick="handleRequestOtp()">
              Get OTP 📩
            </button>
          </div>

          <!-- Step 2: OTP Verification (Hidden initially) -->
          <div id="stepVerifyOtp" style="display:none;">
            <p style="text-align:center;color:var(--text-muted);margin-bottom:15px;font-size:14px;">
              We sent a 6-digit code to <strong id="verifyTargetText" style="color:var(--text-primary);"></strong>.<br/>
              (Check the backend terminal logs since this is a dev environment!)
            </p>
            
            <div class="input-group">
              <label class="input-label">Enter 6-Digit OTP</label>
              <input type="text" class="input-field" id="authOtpCode" placeholder="••••••" maxlength="6" style="text-align:center;letter-spacing:8px;font-size:20px;font-weight:bold;" />
            </div>

            <button class="btn btn-primary btn-lg" style="width:100%;margin-top:10px;" id="btnVerifyOtp" onclick="handleVerifyOtp()">
              Verify & Login 🙏
            </button>
            
            <div style="text-align:center;margin-top:15px;">
              <a href="javascript:void(0)" onclick="resetOtpFlow()" style="color:var(--saffron);font-size:13px;text-decoration:none;">← Change Email/Phone</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

export function initLogin() {
  window.handleRequestOtp = async function () {
    const identifier = document.getElementById('authIdentifier').value.trim();
    const errorEl = document.getElementById('authError');
    const btn = document.getElementById('btnRequestOtp');

    errorEl.classList.remove('visible');

    if (!identifier) {
      errorEl.textContent = 'Please enter a valid email or phone number.';
      errorEl.classList.add('visible');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
      await sendOtp(identifier);

      // Advance to Step 2
      document.getElementById('stepRequestOtp').style.display = 'none';
      document.getElementById('stepVerifyOtp').style.display = 'block';
      document.getElementById('verifyTargetText').textContent = identifier;
      document.getElementById('authTitle').textContent = 'Verify OTP';
      document.getElementById('authSubtitle').textContent = 'Enter the sacred code';

      showToast('OTP sent securely! 📩', 'success');
    } catch (err) {
      errorEl.textContent = err.message || 'Failed to send OTP.';
      errorEl.classList.add('visible');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Get OTP 📩';
    }
  };

  window.handleVerifyOtp = async function () {
    const identifier = document.getElementById('authIdentifier').value.trim();
    const otp = document.getElementById('authOtpCode').value.trim();
    const errorEl = document.getElementById('authError');
    const btn = document.getElementById('btnVerifyOtp');

    errorEl.classList.remove('visible');

    if (!otp || otp.length !== 6) {
      errorEl.textContent = 'Please enter the 6-digit OTP.';
      errorEl.classList.add('visible');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Verifying...';

    try {
      await verifyOtp(identifier, otp);
      showToast('🙏 Login successful! Welcome devotee.', 'success');
      window.location.hash = '#/search';
    } catch (err) {
      errorEl.textContent = err.message || 'Invalid OTP.';
      errorEl.classList.add('visible');
      btn.disabled = false;
      btn.textContent = 'Verify & Login 🙏';
    }
  };

  window.resetOtpFlow = function () {
    document.getElementById('authError').classList.remove('visible');
    document.getElementById('stepRequestOtp').style.display = 'block';
    document.getElementById('stepVerifyOtp').style.display = 'none';
    document.getElementById('authOtpCode').value = '';
    document.getElementById('authTitle').textContent = 'Welcome';
    document.getElementById('authSubtitle').textContent = 'Login with your Phone or Email';
  };

  // Allow Enter key to submit
  document.getElementById('authIdentifier')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleRequestOtp();
  });

  document.getElementById('authOtpCode')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleVerifyOtp();
  });
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
