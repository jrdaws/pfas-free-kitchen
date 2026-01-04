import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Our App";

  return (
    <Html>
      <Head />
      <Preview>Reset your password for {appName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
              width="40"
              height="40"
              alt={appName}
            />
          </Section>

          <Heading style={heading}>Reset Your Password</Heading>

          <Text style={paragraph}>
            We received a request to reset your password. Click the button below
            to create a new password.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>

          <Text style={paragraph}>
            This link will expire in 1 hour. If you didn&apos;t request a password
            reset, you can safely ignore this email.
          </Text>

          <Text style={warningText}>
            If you didn&apos;t request this, please secure your account by changing
            your password immediately.
          </Text>

          <Text style={footer}>
            — The {appName} Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "8px",
  maxWidth: "580px",
};

const logo = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1a1a1a",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#525252",
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#f97316",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 24px",
};

const warningText = {
  fontSize: "14px",
  color: "#ef4444",
  backgroundColor: "#fef2f2",
  padding: "12px 16px",
  borderRadius: "6px",
  margin: "24px 0",
};

const footer = {
  fontSize: "14px",
  color: "#737373",
  marginTop: "32px",
  textAlign: "center" as const,
};

export default PasswordResetEmail;

