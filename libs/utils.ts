/**
 * Splits a message into messages smaller than 2000 characters.
 */
export function splitMessage(message: string): string[] {
  const messages: string[] = [];
  const lines: string[] = message.split("\n");
  let str = "";
  for (const line of lines) {
    if (str.length + line.length + 1 > 2000) {
      messages.push(str.trim());
      str = "";
    }
    str += line + "\n";
  }
  messages.push(str.trim());
  return messages;
}
