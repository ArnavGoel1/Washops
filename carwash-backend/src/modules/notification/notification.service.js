import { EventEmitter } from 'node:events';
import Notification from '../../models/Notification.js';

// Simple in-process event bus. Swap for a message queue (SQS/RabbitMQ)
// if this ever needs to become a real separate service.
export const notificationBus = new EventEmitter();

export async function sendNotification({ userId, type = 'system', message }) {
  const notification = await Notification.create({ user: userId, type, message });
  notificationBus.emit('notification:sent', notification);
  return notification;
}

// Example wiring: other modules call sendNotification() directly,
// or emit domain events here and let this module react (the "Watching" box).
notificationBus.on('notification:sent', (notification) => {
  console.log(`[notification] -> user ${notification.user}: ${notification.message}`);
});
