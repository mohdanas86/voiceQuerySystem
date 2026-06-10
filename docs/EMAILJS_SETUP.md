# EmailJS Template Configuration Documentation
This document outlines the setup, settings, and code templates for the dual-email notification system implemented in the Ulavi Technologies travel query submission platform.

---

## 1. Template A — Customer Confirmation

* **Template ID**: `customer_confirmation`
* **Subject**: `{{subject_line}}`
* **To Email**: `{{to_email}}`
* **From Name**: `Ulavi Technologies`
* **From Email**: *(Leave blank)*
* **Use Default Email Address**: **Toggled ON**
* **Reply To**: `support@ulavitech.com`
* **Bcc / Cc**: *(Leave blank)*

### HTML Code Template
*Ensure you click the source code button (`</>`) on the EmailJS editor toolbar and paste the following HTML:*

```html
<div style="background-color: #F4F1EB; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E8E5DF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); overflow: hidden;">
    
    <!-- Header / Logo Area -->
    <div style="padding: 24px 32px; border-bottom: 1px solid #E8E5DF; background-color: #ffffff; text-align: left;">
      <a href="https://ulavitech.com" target="_blank" style="text-decoration: none; outline: none; display: inline-block;">
        <img height="40" src="https://ulavitech.com/wp-content/uploads/2026/04/2-150x150.png" alt="Ulavi Technologies Logo" style="height: 40px; border: 0; vertical-align: middle;" />
      </a>
    </div>
    
    <!-- Body Content Area -->
    <div style="padding: 32px; background-color: #ffffff;">
      <div style="font-size: 15px; color: #111111; line-height: 1.6; margin: 0;">
        <pre style="white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #111111; margin: 0; padding: 0; border: none; background: none; text-align: left;">{{body_text}}</pre>
      </div>
    </div>
    
    <!-- Footer Area -->
    <div style="padding: 20px 32px; background-color: #F9F8F5; border-top: 1px solid #E8E5DF; text-align: center;">
      <p style="font-size: 11px; color: #6B6A68; margin: 0; font-family: monospace; letter-spacing: 1px; text-transform: uppercase;">
        © 2026 Ulavi Technologies
      </p>
    </div>
    
  </div>
</div>
```

---

## 2. Template B — Ops Notification

* **Template ID**: `ops_notification`
* **Subject**: `New Travel Query — {{trip_city}} — {{phone}}`
* **To Email**: `support@ulavitech.com` *(or your preferred support inbox)*
* **From Name**: `Ulavi Technologies Alert`
* **From Email**: *(Leave blank)*
* **Use Default Email Address**: **Toggled ON**
* **Reply To**: `{{user_email}}` *(routes replies directly to the client's email)*
* **Bcc / Cc**: *(Leave blank)*

### HTML Code Template
*Ensure you click the source code button (`</>`) on the EmailJS editor toolbar and paste the following HTML:*

```html
<style>
@media only screen and (max-width: 600px) {

  .email-wrapper {
    padding: 0 !important;
  }

  .email-container {
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 0 !important;
    border-left: 0 !important;
    border-right: 0 !important;
  }

  .email-header {
    padding: 20px 16px !important;
  }

  .email-logo {
    height: 32px !important;
  }

  .email-title {
    font-size: 18px !important;
  }

  .email-content {
    padding: 20px 16px !important;
  }

  .email-footer {
    padding: 16px !important;
  }

  .mobile-table,
  .mobile-table tbody,
  .mobile-table tr,
  .mobile-table td {
    display: block !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .mobile-table tr {
    margin-bottom: 12px !important;
  }

  .mobile-table td {
    padding: 2px 0 !important;
    border: none !important;
  }

  .mobile-table td:first-child {
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #6B6A68 !important;
    padding-bottom: 2px !important;
  }

  .mobile-table td:last-child {
    padding-bottom: 8px !important;
  }

  .mobile-card {
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    margin-bottom: 24px !important;
    border-radius: 0 !important;
  }

  .mobile-card h3 {
    margin-bottom: 12px !important;
  }

  .query-box {
    padding: 12px !important;
  }
}
</style>

<div class="email-wrapper" style="background-color:#F4F1EB;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  
  <div class="email-container" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #E8E5DF;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.03);">

    <!-- Header -->
    <div class="email-header" style="padding:24px 32px;border-bottom:1px solid #E8E5DF;background:#ffffff;">

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td width="52" valign="middle">
            <a href="https://ulavitech.com" target="_blank" style="text-decoration:none;">
              <img
                class="email-logo"
                src="https://ulavitech.com/wp-content/uploads/2026/04/2-150x150.png"
                alt="Ulavi Technologies Logo"
                style="height:40px;border:0;display:block;"
              />
            </a>
          </td>

          <td valign="middle">
            <h2 class="email-title" style="margin:0;font-size:20px;color:#111111;font-weight:600;">
              Ulavi Technologies
            </h2>
          </td>
        </tr>
      </table>

    </div>

    <!-- Content -->
    <div class="email-content" style="padding:32px;background:#ffffff;">

      <h2 style="font-size:18px;font-weight:700;color:#111111;margin:0 0 10px;">
        New Travel Query Received
      </h2>

      <p style="font-size:14px;color:#6B6A68;margin:0 0 24px;">
        Submitted at: {{submitted_at}}
      </p>

      <!-- Customer Info -->
      <table class="mobile-table" style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="width:35%;font-size:13px;font-weight:700;color:#6B6A68;padding:8px 0;border-bottom:1px solid #F4F1EB;">
            Customer Name:
          </td>
          <td style="font-size:14px;color:#111111;padding:8px 0;border-bottom:1px solid #F4F1EB;">
            {{customer_name}}
          </td>
        </tr>

        <tr>
          <td style="font-size:13px;font-weight:700;color:#6B6A68;padding:8px 0;border-bottom:1px solid #F4F1EB;">
            Language:
          </td>
          <td style="font-size:14px;color:#111111;padding:8px 0;border-bottom:1px solid #F4F1EB;">
            {{original_query_language}}
          </td>
        </tr>
      </table>

      <!-- Query Section -->
      <div style="margin-bottom:24px;">

        <h3 style="font-size:13px;font-weight:700;color:#6B6A68;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px;">
          Original Query ({{original_query_language}})
        </h3>

        <div class="query-box" style="background:#F9F8F5;border-left:3px solid #E85D22;padding:12px 16px;border-radius:0 8px 8px 0;font-size:14px;color:#111111;line-height:1.6;margin-bottom:16px;">
          {{original_query}}
        </div>

        <h3 style="font-size:13px;font-weight:700;color:#6B6A68;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px;">
          English Translation
        </h3>

        <div class="query-box" style="background:#F9F8F5;border-left:3px solid #111111;padding:12px 16px;border-radius:0 8px 8px 0;font-size:14px;color:#111111;line-height:1.6;margin-bottom:16px;">
          {{english_translation}}
        </div>

        <h3 style="font-size:13px;font-weight:700;color:#6B6A68;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px;">
          🎙 Voice Recording
        </h3>

        <p style="font-size:14px;line-height:1.5;color:#111111;margin:0;">
          {{{audio_line}}}
        </p>

      </div>

      <!-- Trip Details -->
      <div class="mobile-card" style="border:1px solid #E8E5DF;border-radius:12px;background:#F9F8F5;padding:20px;margin-bottom:24px;">

        <h3 style="font-size:13px;font-weight:700;color:#111111;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;padding-bottom:8px;border-bottom:1px solid #E8E5DF;">
          Trip Details
        </h3>

        <table class="mobile-table" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:40%;font-size:13px;color:#6B6A68;padding:6px 0;">
              Destination:
            </td>
            <td style="font-size:14px;font-weight:700;color:#111111;padding:6px 0;">
              {{trip_city}}
            </td>
          </tr>

          <tr>
            <td style="font-size:13px;color:#6B6A68;padding:6px 0;">
              Travel Dates:
            </td>
            <td style="font-size:14px;font-weight:700;color:#111111;padding:6px 0;">
              {{trip_dates}}
            </td>
          </tr>

          <tr>
            <td style="font-size:13px;color:#6B6A68;padding:6px 0;">
              Passengers:
            </td>
            <td style="font-size:14px;font-weight:700;color:#111111;padding:6px 0;">
              {{trip_passengers}}
            </td>
          </tr>

          <tr>
            <td style="font-size:13px;color:#6B6A68;padding:6px 0;">
              Budget:
            </td>
            <td style="font-size:14px;font-weight:700;color:#111111;padding:6px 0;">
              {{trip_budget}}
            </td>
          </tr>
        </table>

      </div>

      <!-- Contact Details -->
      <div class="mobile-card" style="border:1px solid #E8E5DF;border-radius:12px;background:#F9F8F5;padding:20px;margin-bottom:24px;">

        <h3 style="font-size:13px;font-weight:700;color:#111111;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 14px;padding-bottom:8px;border-bottom:1px solid #E8E5DF;">
          Contact Details
        </h3>

        <table class="mobile-table" style="width:100%;border-collapse:collapse;">

          <tr>
            <td style="width:40%;font-size:13px;color:#6B6A68;padding:6px 0;">
              Email:
            </td>
            <td style="font-size:14px;font-weight:700;color:#111111;padding:6px 0;">
              <a href="mailto:{{user_email}}" style="color:#E85D22;text-decoration:none;">
                {{user_email}}
              </a>
            </td>
          </tr>

          <tr>
            <td style="font-size:13px;color:#6B6A68;padding:6px 0;">
              Phone:
            </td>
            <td style="font-size:14px;font-weight:700;color:#111111;padding:6px 0;">
              <a href="tel:{{phone}}" style="color:#E85D22;text-decoration:none;">
                {{phone}}
              </a>
            </td>
          </tr>

        </table>

      </div>

      <!-- Action Box -->
      <div style="background:rgba(232,93,34,0.08);border:1px solid rgba(232,93,34,0.2);border-radius:12px;padding:16px 20px;text-align:center;">
        <p style="font-size:13px;color:#E85D22;font-weight:700;margin:0;">
          ⚡ {{action_prompt}}
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div class="email-footer" style="padding:20px 32px;background:#F9F8F5;border-top:1px solid #E8E5DF;text-align:center;">

      <p style="font-size:11px;color:#6B6A68;margin:0;font-family:monospace;letter-spacing:1px;text-transform:uppercase;">
        © 2026 Ulavi Technologies
      </p>

    </div>

  </div>

</div>
```
