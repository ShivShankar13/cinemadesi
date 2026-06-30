package com.cinemadesi.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

/**
 * Outbound transactional emails. Currently only password reset; new
 * templates plug in as more methods here.
 *
 * <p>If {@code spring.mail.username} is blank, sending is treated as
 * "not configured" — methods log a clear warning and return without
 * throwing, so the password-reset flow still works (the URL is in the
 * existing {@code [PASSWORD RESET]} log line).</p>
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender sender;
    private final String fromAddress;
    private final String fromName;
    private final boolean configured;

    public EmailService(
            JavaMailSender sender,
            @Value("${app.email.from-address}") String fromAddress,
            @Value("${app.email.from-name}") String fromName,
            @Value("${spring.mail.username:}") String username
    ) {
        this.sender      = sender;
        this.fromAddress = fromAddress;
        this.fromName    = fromName;
        // We treat blank MAIL_USERNAME as "mail not configured".
        this.configured  = username != null && !username.isBlank();
        if (!configured) {
            log.warn("EmailService: MAIL_USERNAME is empty — outbound emails will be skipped. "
                    + "Set MAIL_USERNAME + MAIL_PASSWORD to send for real.");
        }
    }

    public void sendPasswordReset(String toEmail, String displayName, String resetUrl) {
        if (!configured) {
            log.warn("[EMAIL SKIPPED] would have sent password reset to {} — {}", toEmail, resetUrl);
            return;
        }

        String name = (displayName == null || displayName.isBlank()) ? "there" : displayName;
        String subject = "Reset your CinemaDesi password";
        String plainBody = """
                Hi %s,

                You asked to reset your CinemaDesi password. Click the link below to
                set a new one — it expires in 30 minutes.

                %s

                If you didn't ask for this, you can safely ignore this email.

                — CinemaDesi
                """.formatted(name, resetUrl);

        String htmlBody = buildHtmlBody(name, resetUrl);

        try {
            MimeMessage mime = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    mime,
                    /*multipart*/ true,
                    StandardCharsets.UTF_8.name()
            );
            helper.setFrom(new InternetAddress(fromAddress, fromName, StandardCharsets.UTF_8.name()));
            helper.setTo(toEmail);
            helper.setSubject(subject);
            // First arg = plain text fallback, second = HTML.
            // Mail clients pick whichever they prefer.
            helper.setText(plainBody, htmlBody);
            sender.send(mime);
            log.info("Password reset email sent to {}", toEmail);
        } catch (MessagingException | UnsupportedEncodingException ex) {
            // Don't propagate — anti-enumeration response shape would change.
            log.error("Failed to send password reset email to {}: {}", toEmail, ex.getMessage());
        }
    }

    // ---- HTML template ------------------------------------------------------
    // Inlined styles because every other email client strips <style> blocks.

    private static String buildHtmlBody(String name, String resetUrl) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head><meta charset="UTF-8"></head>
                <body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#F0ECE3;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#080808;padding:32px 16px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#101010;border:1px solid #1F1F1F;border-radius:14px;overflow:hidden;">

                          <!-- Brand strip -->
                          <tr>
                            <td style="padding:32px 32px 16px 32px;">
                              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#F0ECE3;">
                                Cinema<span style="color:#E8B84B;">Desi</span>
                              </p>
                            </td>
                          </tr>

                          <!-- Heading -->
                          <tr>
                            <td style="padding:8px 32px 4px 32px;">
                              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#F0ECE3;line-height:1.25;">
                                Reset your password
                              </p>
                            </td>
                          </tr>

                          <!-- Body -->
                          <tr>
                            <td style="padding:12px 32px 0 32px;">
                              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#9b948c;">
                                Hi %s, we got a request to reset your CinemaDesi password.
                                Tap the button below to set a new one. The link expires in 30 minutes.
                              </p>
                            </td>
                          </tr>

                          <!-- CTA -->
                          <tr>
                            <td style="padding:20px 32px 8px 32px;">
                              <a href="%s"
                                 style="display:inline-block;background:#E8B84B;color:#080808;font-weight:700;font-size:15px;padding:12px 22px;border-radius:10px;text-decoration:none;letter-spacing:0.2px;">
                                Reset password
                              </a>
                            </td>
                          </tr>

                          <!-- Plain URL fallback -->
                          <tr>
                            <td style="padding:8px 32px 0 32px;">
                              <p style="margin:16px 0 4px 0;font-size:12px;color:#7A7570;text-transform:uppercase;letter-spacing:0.18em;">
                                Or copy this link:
                              </p>
                              <p style="margin:0 0 16px 0;font-size:12px;word-break:break-all;">
                                <a href="%s" style="color:#E8B84B;text-decoration:none;">%s</a>
                              </p>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="padding:24px 32px 32px 32px;border-top:1px solid #1F1F1F;">
                              <p style="margin:0;font-size:12px;color:#7A7570;line-height:1.5;">
                                Didn't ask for this? You can ignore this email — your password
                                stays the same. The link expires automatically.
                              </p>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:16px 0 0 0;font-size:11px;color:#3A3530;letter-spacing:0.1em;">
                          CinemaDesi · Indian cinema, logged.
                        </p>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(name, resetUrl, resetUrl, resetUrl);
    }
}
