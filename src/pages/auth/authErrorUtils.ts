
export const errorMessages: Record<string, string> = {
  "User already registered": "อีเมลนี้ถูกใช้งานแล้ว",
  "Invalid login credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  "Email not confirmed": "กรุณายืนยันอีเมลของคุณ",
};

export function getErrorText(msg: string): string {
  for (const [code, thMsg] of Object.entries(errorMessages)) {
    if (msg.includes(code)) return thMsg;
  }
  return msg;
}
