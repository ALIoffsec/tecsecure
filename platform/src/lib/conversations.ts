/**
 * Conversations between a customer and staff: who has unread messages and what a new message changes on the
 * conversation. Pure, so it is tested alone.
 */
export const CUSTOMER_SENDER = "CUSTOMER";
export const STAFF_SENDER = "ADMIN";
export const MESSAGE_MAX = 3000;

type Message = { sender: string; createdAt: Date | string };

const newer = (message: Message, readAt: Date | string | null) => !readAt || new Date(message.createdAt).getTime() > new Date(readAt).getTime();

/** Staff replies the customer has not seen yet. */
export function unreadForCustomer(messages: Message[], customerReadAt: Date | string | null): number {
  return messages.filter(message => message.sender !== CUSTOMER_SENDER && newer(message, customerReadAt)).length;
}

/** Customer messages staff have not opened yet. */
export function unreadForStaff(messages: Message[], staffReadAt: Date | string | null): number {
  return messages.filter(message => message.sender === CUSTOMER_SENDER && newer(message, staffReadAt)).length;
}

/**
 * What a new message does to its conversation: it becomes the newest, the writer has read everything up to it,
 * and a customer writing into a closed conversation opens it again.
 */
export function afterMessage(sender: string, now = new Date()): { lastMessageAt: Date; status?: "OPEN"; customerReadAt?: Date; staffReadAt?: Date } {
  return sender === CUSTOMER_SENDER
    ? { lastMessageAt: now, status: "OPEN", customerReadAt: now }
    : { lastMessageAt: now, staffReadAt: now };
}
