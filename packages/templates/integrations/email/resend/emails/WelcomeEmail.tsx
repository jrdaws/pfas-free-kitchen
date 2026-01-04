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
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {{projectName}}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to {{projectName}}! 🎉</Heading>
          
          <Text style={text}>Hi {name},</Text>
          
          <Text style={text}>
            Thanks for signing up! We&apos;re excited to have you on board.
          </Text>
          
          <Text style={text}>
            Here&apos;s what you can do to get started:
          </Text>
          
          <Section style={list}>
            <Text style={listItem}>✓ Complete your profile</Text>
            <Text style={listItem}>✓ Explore our features</Text>
            <Text style={listItem}>✓ Connect with the community</Text>
          </Section>
          
          <Section style={buttonContainer}>
            <Button style={button} href="{{appUrl}}/dashboard">
              Go to Dashboard
            </Button>
          </Section>
          
          <Text style={text}>
            If you have any questions, just reply to this email. We&apos;re here to help!
          </Text>
          
          <Text style={footer}>
            — The {{projectName}} Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "40px",
  margin: "0 0 20px",
};

const text = {
  color: "#444",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

const list = {
  margin: "0 0 24px",
};

const listItem = {
  color: "#444",
  fontSize: "16px",
  lineHeight: "32px",
  margin: "0",
};

const buttonContainer = {
  margin: "24px 0",
};

const button = {
  backgroundColor: "#000",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  margin: "32px 0 0",
};

export default WelcomeEmail;

