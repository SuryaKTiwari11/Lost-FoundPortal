import * as React from "react";
import {
  Html,
  Button,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Img,
  Link,
  Preview,
} from "@react-email/components";

// Define props interface for type safety
interface EmailProps {
  url: string;
  username?: string;
  expiryTime?: string;
}

// Define style types for better type checking
type StyleObject = React.CSSProperties & {
  [key: string]: string | number | undefined;
};

export function VerificationEmail({
  url,
  username = "User",
  expiryTime = "24 hours",
}: EmailProps): JSX.Element {
  // Color theme updated to match the website
  const colors = {
    primary: "#FFD166",
    secondary: "#333333",
    background: "#121212",
    backgroundLight: "#1A1A1A",
    text: "#FFFFFF",
    textDark: "#121212",
    border: "#2A2A2A",
  } as const;

  const main: StyleObject = {
    backgroundColor: colors.background,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const container: StyleObject = {
    margin: "0 auto",
    padding: "20px 0",
    maxWidth: "600px",
  };

  const header: StyleObject = {
    background: "linear-gradient(to right, #1A1A1A, #2A2A2A)",
    padding: "20px",
    borderRadius: "8px 8px 0 0",
    textAlign: "center" as const,
  };

  const section: StyleObject = {
    backgroundColor: colors.backgroundLight,
    padding: "30px",
    borderRadius: "0 0 8px 8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
  };

  const button: StyleObject = {
    backgroundColor: colors.primary,
    color: colors.textDark,
    borderRadius: "6px",
    fontWeight: "bold",
    padding: "14px 24px",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
  };

  const footer: StyleObject = {
    color: colors.text,
    fontSize: "14px",
    marginTop: "20px",
    textAlign: "center" as const,
  };

  return (
    <Html lang="en">
      <Head />
      <Preview>Verify your email for Lost & Found Portal</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://via.placeholder.com/150x80?text=Lost+and+Found"
              alt="Lost and Found Portal Logo"
              width="150"
              height="80"
            />
          </Section>

          <Section style={section}>
            <Text
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: colors.primary,
              }}
            >
              Email Verification
            </Text>

            <Text
              style={{
                color: colors.text,
                lineHeight: "1.5",
                marginTop: "14px",
              }}
            >
              Hi {username},
            </Text>

            <Text style={{ color: colors.text, lineHeight: "1.5" }}>
              Thank you for registering with the Lost & Found Portal. Please
              verify your email address by clicking the button below.
            </Text>

            <Section style={{ textAlign: "center", margin: "30px 0" }}>
              <Button href={url} style={button}>
                Verify Email Address
              </Button>
            </Section>

            <Text
              style={{
                color: colors.text,
                lineHeight: "1.5",
                fontSize: "14px",
              }}
            >
              If the button doesn't work, you can also copy and paste this link
              into your browser:
            </Text>

            <Text
              style={{
                color: colors.primary,
                lineHeight: "1.5",
                fontSize: "14px",
                wordBreak: "break-all",
              }}
            >
              {url}
            </Text>

            <Text
              style={{
                color: colors.text,
                lineHeight: "1.5",
                fontSize: "14px",
              }}
            >
              This verification link will expire in {expiryTime}.
            </Text>

            <Hr style={{ borderColor: colors.border, margin: "20px 0" }} />

            <Text
              style={{
                color: colors.text,
                lineHeight: "1.5",
                fontSize: "14px",
              }}
            >
              If you didn't create an account on our platform, you can safely
              ignore this email.
            </Text>
          </Section>

          <Text style={footer}>
            © {new Date().getFullYear()} Lost & Found Portal. All rights
            reserved.
          </Text>

          <Text style={{ ...footer, marginTop: "10px" }}>
            <Link
              href="#"
              style={{ color: colors.primary, textDecoration: "none" }}
            >
              Terms of Service
            </Link>
            {" • "}
            <Link
              href="#"
              style={{ color: colors.primary, textDecoration: "none" }}
            >
              Privacy Policy
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Default export for Next.js compatibility
export default VerificationEmail;
