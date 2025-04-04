import { Resend } from "resend";

// Create a new instance of Resend with your API key
export const resend = new Resend(process.env.RESEND_API_KEY);

// If you're not using environment variables, you can use:
// export const resend = new Resend('your_api_key_here');
