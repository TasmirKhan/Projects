import nodemailer from 'nodemailer';

export async function sendWorkflowEmail(input:{to?:string;subject:string;text:string}) {
  try {
    const host=process.env.SMTP_HOST; const port=Number(process.env.SMTP_PORT||587);
    const user=process.env.SMTP_USER; const pass=process.env.SMTP_PASS; const from=process.env.SMTP_FROM;
    if(!host||!user||!pass||!from) return { sent:false, reason:'SMTP configuration incomplete (need SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM)' };
    const transporter = nodemailer.createTransport({ host, port, secure: port===465, auth:{ user, pass } });
    await transporter.sendMail({ from, replyTo: user, to: input.to || user, subject: input.subject, text: input.text });
    return { sent:true };
  } catch(e:any) {
    return { sent:false, reason:e?.message || 'SMTP send failed' };
  }
}
