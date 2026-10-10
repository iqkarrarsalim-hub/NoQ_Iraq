import { formatIQD } from './constants';

export function formatIraqiWhatsAppPhone(phone: string): string {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('07')) {
    cleanPhone = '964' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('7') && cleanPhone.length === 10) {
    cleanPhone = '964' + cleanPhone;
  } else if (!cleanPhone.startsWith('964')) {
    cleanPhone = '964' + cleanPhone;
  }
  return cleanPhone;
}

export function generateWhatsAppUrl(
  phone: string,
  listingTitle: string,
  date?: string,
  shiftName?: string
): string {
  const cleanPhone = formatIraqiWhatsAppPhone(phone);

  let message = `السلام عليكم، أريد الاستفسار عن حجز مكان [${listingTitle}] عبر منصة احجز بالبصرة.`;
  if (date) {
    message += `\nالتاريخ المطلوب: ${date}`;
  }
  if (shiftName) {
    message += `\nالفترة / الشفت: ${shiftName}`;
  }
  message += `\nهل الشفت متاح؟`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function generateProviderNotificationUrl(
  providerPhone: string,
  booking: {
    bookingNumber: string;
    listingTitle: string;
    bookingDate: string;
    shiftName?: string;
    startTime?: string;
    endTime?: string;
    totalPrice: number;
    customerName: string;
    customerPhone: string;
  }
): string {
  const cleanPhone = formatIraqiWhatsAppPhone(providerPhone);

  const shiftInfo = booking.shiftName || `${booking.startTime || ''} - ${booking.endTime || ''}`;

  const message =
    `السلام عليكم، وصلك طلب حجز جديد عبر منصة *احجز بالبصرة* 🏖️\n\n` +
    `📌 *رقم الحجز:* ${booking.bookingNumber}\n` +
    `🏢 *المكان:* ${booking.listingTitle}\n` +
    `📅 *التاريخ:* ${booking.bookingDate}\n` +
    `⏰ *الوقت/الشفت:* ${shiftInfo}\n` +
    `💵 *المبلغ الكلي:* ${formatIQD(booking.totalPrice)}\n` +
    `👤 *اسم الزبون:* ${booking.customerName}\n` +
    `📞 *رقم زبون:* ${booking.customerPhone}\n\n` +
    `يرجى الدخول للوحة التحكم لمراجعة وقبول الطلب.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateCustomerConfirmationUrl(
  customerPhone: string,
  booking: {
    bookingNumber: string;
    listingTitle: string;
    bookingDate: string;
    shiftName?: string;
    startTime?: string;
    endTime?: string;
    totalPrice: number;
    providerPhone?: string;
    address?: string;
  }
): string {
  const cleanPhone = formatIraqiWhatsAppPhone(customerPhone);
  const shiftInfo = booking.shiftName || `${booking.startTime || ''} - ${booking.endTime || ''}`;

  let message =
    `السلام عليكم، مبارك! تم *قبول وتأكيد حجزك* بنجاح عبر منصة *احجز بالبصرة* 🎉\n\n` +
    `📌 *رقم الحجز:* ${booking.bookingNumber}\n` +
    `🏢 *المكان:* ${booking.listingTitle}\n` +
    `📅 *التاريخ:* ${booking.bookingDate}\n` +
    `⏰ *الوقت/الشفت:* ${shiftInfo}\n` +
    `💵 *المبلغ الكلي:* ${formatIQD(booking.totalPrice)}\n`;

  if (booking.address) {
    message += `📍 *العنوان:* ${booking.address}\n`;
  }
  if (booking.providerPhone) {
    message += `📞 *تواصل المالك:* ${booking.providerPhone}\n`;
  }

  message += `\nنتمنى لك أوقاتاً ممتعة بالبصرة! ❤️`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
