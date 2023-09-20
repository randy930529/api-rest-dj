//import { transporter } from "../../utils/emailService";

export async function useSendMail(mail) {
  try {
    //await transporter.sendMail(mail);
  } catch (error) {
    throw new Error(error.message);
  }
}
