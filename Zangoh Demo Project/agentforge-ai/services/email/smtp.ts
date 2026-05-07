import nodemailer from 'nodemailer';

export async function sendWorkflowEmail(input:{to?:string;subject:string;text:string}) {
  const host=process.env.SMTP_HOST; const port=Number(process.env.SMTP_PORT||587);
  const user=process.env.SMTP_USER; const pass=process.env.SMTP_PASS; const from=process.env.SMTP_FROM;
  if(!host||!user||!pass||!from) return { sent:false, reason:'SMTP not configured' };
  const transporter = nodemailer.createTransport({ host, port, secure: port===465, auth:{ user, pass } });
  await transporter.sendMail({ from, to: input.to || from, subject: input.subject, text: input.text });
  return { sent:true };
}
