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
  Row,
  Column,
} from "@react-email/components";

interface InvoiceEmailProps {
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export function InvoiceEmail({
  invoiceNumber,
  amount,
  dueDate,
  items,
}: InvoiceEmailProps) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Our App";

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return (
    <Html>
      <Head />
      <Preview>
        Invoice #{invoiceNumber} - {formatCurrency(amount)} due {dueDate}
      </Preview>
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

          <Heading style={heading}>Invoice #{invoiceNumber}</Heading>

          <Text style={paragraph}>
            Here&apos;s your invoice for your recent purchase.
          </Text>

          {/* Invoice Details */}
          <Section style={invoiceBox}>
            <Row style={invoiceHeader}>
              <Column>
                <Text style={invoiceLabel}>Invoice Number</Text>
                <Text style={invoiceValue}>{invoiceNumber}</Text>
              </Column>
              <Column>
                <Text style={invoiceLabel}>Due Date</Text>
                <Text style={invoiceValue}>{dueDate}</Text>
              </Column>
            </Row>

            {/* Line Items */}
            <Section style={itemsSection}>
              <Row style={itemsHeader}>
                <Column style={{ width: "60%" }}>
                  <Text style={itemsHeaderText}>Item</Text>
                </Column>
                <Column style={{ width: "20%", textAlign: "center" as const }}>
                  <Text style={itemsHeaderText}>Qty</Text>
                </Column>
                <Column style={{ width: "20%", textAlign: "right" as const }}>
                  <Text style={itemsHeaderText}>Price</Text>
                </Column>
              </Row>

              {items.map((item, index) => (
                <Row key={index} style={itemRow}>
                  <Column style={{ width: "60%" }}>
                    <Text style={itemText}>{item.name}</Text>
                  </Column>
                  <Column style={{ width: "20%", textAlign: "center" as const }}>
                    <Text style={itemText}>{item.quantity}</Text>
                  </Column>
                  <Column style={{ width: "20%", textAlign: "right" as const }}>
                    <Text style={itemText}>
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            {/* Total */}
            <Row style={totalRow}>
              <Column style={{ width: "70%" }}>
                <Text style={totalLabel}>Total Due</Text>
              </Column>
              <Column style={{ width: "30%", textAlign: "right" as const }}>
                <Text style={totalValue}>{formatCurrency(amount)}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/billing/invoices/${invoiceNumber}`}
            >
              Pay Now
            </Button>
          </Section>

          <Text style={footer}>
            Questions about your invoice? Contact us at support@example.com
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

const invoiceBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const invoiceHeader = {
  marginBottom: "24px",
};

const invoiceLabel = {
  fontSize: "12px",
  color: "#737373",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
};

const invoiceValue = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0",
};

const itemsSection = {
  borderTop: "1px solid #e5e5e5",
  paddingTop: "16px",
};

const itemsHeader = {
  borderBottom: "1px solid #e5e5e5",
  paddingBottom: "8px",
  marginBottom: "8px",
};

const itemsHeaderText = {
  fontSize: "12px",
  color: "#737373",
  fontWeight: "600",
  margin: "0",
};

const itemRow = {
  paddingTop: "8px",
  paddingBottom: "8px",
};

const itemText = {
  fontSize: "14px",
  color: "#525252",
  margin: "0",
};

const totalRow = {
  borderTop: "2px solid #1a1a1a",
  marginTop: "16px",
  paddingTop: "16px",
};

const totalLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0",
};

const totalValue = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#1a1a1a",
  margin: "0",
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
  textAlign: "center" as const,
};

export default InvoiceEmail;

