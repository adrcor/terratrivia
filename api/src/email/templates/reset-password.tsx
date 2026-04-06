/** @jsxImportSource react */
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export function ResetPassword({ url }: { url: string }) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Reset your password</Heading>
          <Text style={text}>Click the button below to reset your TerraTrivia password.</Text>
          <Section style={buttonSection}>
            <Button style={button} href={url}>
              Reset Password
            </Button>
          </Section>
          <Text style={footer}>
            If you didn't request a password reset, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "480px",
};
const heading = { fontSize: "24px", marginBottom: "16px" };
const text = { fontSize: "16px", lineHeight: "1.5", color: "#333" };
const buttonSection = { textAlign: "center" as const, margin: "32px 0" };
const button = {
  backgroundColor: "#000",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontSize: "16px",
  textDecoration: "none",
};
const footer = { fontSize: "14px", color: "#666" };
