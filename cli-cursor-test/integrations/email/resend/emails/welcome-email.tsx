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

interface WelcomeEmailProps {
  userName?: string;
  loginUrl?: string;
}

export function WelcomeEmail({
  userName = "there",
  loginUrl = "https://yourapp.com/login",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to our platform!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Our Platform! 🎉</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Thanks for signing up! We're excited to have you on board.
          </Text>
          <Text style={text}>
            To get started, click the button below to log in to your account:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Get Started
            </Button>
          </Section>
          <Text style={text}>
            If you have any questions, feel free to reply to this email.
          </Text>
          <Text style={footer}>
            Best regards,
            <br />
            The Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 20px",
};

const buttonContainer = {
  padding: "27px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 20px",
  marginTop: "32px",
};

export default WelcomeEmail;
