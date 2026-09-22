import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app


def send_email(to_email, subject, html_body):
    """
    Sends an email via Gmail SMTP using MAIL_USERNAME/MAIL_PASSWORD from config.
    Fails loudly in logs but never crashes the calling request.
    """
    mail_username = current_app.config.get("MAIL_USERNAME")
    mail_password = current_app.config.get("MAIL_PASSWORD")
    mail_from = current_app.config.get("MAIL_FROM", mail_username)

    if not mail_username or not mail_password:
        current_app.logger.warning("Email not sent (MAIL_USERNAME/MAIL_PASSWORD not configured): %s", subject)
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = mail_from
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(mail_username, mail_password)
            server.sendmail(mail_from, to_email, msg.as_string())
        return True
    except Exception as e:
        current_app.logger.error("Failed to send email to %s: %s", to_email, e)
        return False