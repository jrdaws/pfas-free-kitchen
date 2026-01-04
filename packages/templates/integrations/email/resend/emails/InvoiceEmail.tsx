import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface InvoiceEmailProps {
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  items: { name: string; quantity: number; price: number }[];
}

export function InvoiceEmail({
  invoiceNumber,
  amount,
  dueDate,
  items,
}: InvoiceEmailProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return (
    <Html>
      <Head />
      <Preview>Invoice #{invoiceNumber} from {{projectName}}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Invoice #{invoiceNumber}</Heading>
          
          <Section style={infoSection}>
            <Row>
              <Column>
                <Text style={label}>Amount Due</Text>
                <Text style={amount_text}>{formatCurrency(amount)}</Text>
              </Column>
              <Column>
                <Text style={label}>Due Date</Text>
                <Text style={value}>{dueDate}</Text>
              </Column>
            </Row>
          </Section>
          
          <Hr style={divider} />
          
          <Section>
            <Text style={sectionTitle}>Items</Text>
            
            <Row style={tableHeader}>
              <Column style={{ width: "50%" }}>
                <Text style={headerText}>Description</Text>
              </Column>
              <Column style={{ width: "20%" }}>
                <Text style={headerText}>Qty</Text>
              </Column>
              <Column style={{ width: "30%" }}>
                <Text style={{ ...headerText, textAlign: "right" }}>Price</Text>
              </Column>
            </Row>
            
            {items.map((item, index) => (
              <Row key={index} style={tableRow}>
                <Column style={{ width: "50%" }}>
                  <Text style={cellText}>{item.name}</Text>
                </Column>
                <Column style={{ width: "20%" }}>
                  <Text style={cellText}>{item.quantity}</Text>
                </Column>
                <Column style={{ width: "30%" }}>
                  <Text style={{ ...cellText, textAlign: "right" }}>
                    {formatCurrency(item.price)}
                  </Text>
                </Column>
              </Row>
            ))}
            
            <Hr style={divider} />
            
            <Row>
              <Column style={{ width: "70%" }}>
                <Text style={{ ...cellText, fontWeight: "600" }}>Total</Text>
              </Column>
              <Column style={{ width: "30%" }}>
                <Text style={{ ...cellText, fontWeight: "600", textAlign: "right" }}>
                  {formatCurrency(amount)}
                </Text>
              </Column>
            </Row>
          </Section>
          
          <Text style={footer}>
            Questions? Reply to this email or contact support@{{projectDomain}}
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
  margin: "0 0 24px",
};

const infoSection = {
  marginBottom: "24px",
};

const label = {
  color: "#898989",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};

const amount_text = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "600",
  margin: "0",
};

const value = {
  color: "#1a1a1a",
  fontSize: "16px",
  margin: "0",
};

const divider = {
  borderColor: "#e6e6e6",
  margin: "24px 0",
};

const sectionTitle = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const tableHeader = {
  backgroundColor: "#f6f9fc",
  padding: "8px 0",
};

const headerText = {
  color: "#898989",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  margin: "0",
};

const tableRow = {
  borderBottom: "1px solid #e6e6e6",
  padding: "12px 0",
};

const cellText = {
  color: "#1a1a1a",
  fontSize: "14px",
  margin: "0",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  margin: "32px 0 0",
  textAlign: "center" as const,
};

export default InvoiceEmail;

