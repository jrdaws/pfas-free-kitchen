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

interface PasswordResetEmailProps {
  resetLink: string;
}

export function PasswordResetEmail({ resetLink }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password for {{projectName}}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset your password</Heading>
          
          <Text style={text}>
            We received a request to reset your password. Click the button below
            to choose a new password.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={resetLink}>
              Reset Password
            </Button>
          </Section>
          
          <Text style={text}>
            This link will expire in 1 hour. If you didn&apos;t request a password
            reset, you can safely ignore this email.
          </Text>
          
          <Text style={text}>
            If the button doesn&apos;t work, copy and paste this URL into your browser:
          </Text>
          
          <Text style={link}>{resetLink}</Text>
          
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

const link = {
  color: "#2563eb",
  fontSize: "14px",
  lineHeight: "24px",
  wordBreak: "break-all" as const,
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  margin: "32px 0 0",
};

export default PasswordResetEmail;

