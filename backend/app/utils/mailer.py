import requests
from flask import current_app


def send_email(to_email, subject, html_body):
    """
    Sends an email via Resend's HTTPS API (not raw SMTP — cloud hosts like
    Railway often block/throttle outbound SMTP ports and IPv6 SMTP routes,
    which caused requests to hang or fail with 'Network is unreachable'.
    An HTTPS API call behaves like any normal web request, so it doesn't
    hit that problem.
    """
    api_key = current_app.config.get("RESEND_API_KEY")
    mail_from = current_app.config.get("MAIL_FROM", "Univista News <onboarding@resend.dev>")

    if not api_key:
        current_app.logger.warning("Email not sent (RESEND_API_KEY not configured): %s", subject)
        return False

    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "from": mail_from,
                "to": [to_email],
                "subject": subject,
                "html": html_body,
            },
            timeout=10,  # fail fast instead of hanging the whole request
        )
        if response.status_code >= 400:
            current_app.logger.error(
                "Resend API error sending to %s: %s %s",
                to_email, response.status_code, response.text,
            )
            return False
        return True
    except requests.RequestException as e:
        current_app.logger.error("Failed to send email to %s: %s", to_email, e)
        return False