import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Our App";

  return (
    <Html>
      <Head />
      <Preview>Welcome to {appName}!</Preview>
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

          <Heading style={heading}>Welcome to {appName}!</Heading>

          <Text style={paragraph}>Hi {name},</Text>

          <Text style={paragraph}>
            Thanks for signing up! We&apos;re excited to have you on board.
          </Text>

          <Text style={paragraph}>
            Get started by exploring your dashboard and setting up your profile.
          </Text>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
            >
              Go to Dashboard
            </Button>
          </Section>

          <Text style={paragraph}>
            If you have any questions, just reply to this email—we&apos;re always
            happy to help.
          </Text>

          <Text style={footer}>
            Best,
            <br />
            The {appName} Team
          </Text>

          <Section style={footerLinks}>
            <Link style={footerLink} href={`${process.env.NEXT_PUBLIC_APP_URL}`}>
              Website
            </Link>
            {" · "}
            <Link
              style={footerLink}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/docs`}
            >
              Documentation
            </Link>
            {" · "}
            <Link
              style={footerLink}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/support`}
            >
              Support
            </Link>
          </Section>
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

const footer = {
  fontSize: "14px",
  color: "#737373",
  marginTop: "32px",
};

const footerLinks = {
  textAlign: "center" as const,
  marginTop: "24px",
  paddingTop: "24px",
  borderTop: "1px solid #e5e5e5",
};

const footerLink = {
  color: "#737373",
  fontSize: "12px",
  textDecoration: "underline",
};

export default WelcomeEmail;

