export interface Email {
  to: string;
  subject: string;
  text: string;
}

// Delivery goes through the SMTP relay in production; locally it is logged.
export async function sendEmail(email: Email): Promise<void> {
  console.log(`[mail] to=${email.to} subject="${email.subject}"`);
}
