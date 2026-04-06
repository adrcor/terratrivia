import { ResetPassword } from "./templates/reset-password";
import { VerifyEmail } from "./templates/verify-email";
import { EMAIL_FROM, RESEND_API_KEY } from "@/env";
import { render } from "@react-email/components";
import { Resend } from "resend";

const resend = new Resend(RESEND_API_KEY);

export async function sendVerificationEmail(data: { user: { email: string }; url: string }) {
  const html = await render(VerifyEmail({ url: data.url }));

  return resend.emails.send({
    from: EMAIL_FROM,
    to: data.user.email,
    subject: "Verify your email — TerraTrivia",
    html,
  });
}

export async function sendResetPasswordEmail(data: { user: { email: string }; url: string }) {
  const html = await render(ResetPassword({ url: data.url }));

  return resend.emails.send({
    from: EMAIL_FROM,
    to: data.user.email,
    subject: "Reset your password — TerraTrivia",
    html,
  });
}
