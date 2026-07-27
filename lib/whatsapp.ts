/**
 * WhatsApp Order Notifications Service
 * 
 * IMPORTANT NOTE FOR PRODUCTION DEPLOYMENT:
 * Integrating the real Meta WhatsApp Business Cloud API requires:
 * 1. A Meta Business Suite Manager Account.
 * 2. A verified Business Phone Number configured with WhatsApp Business.
 * 3. A WhatsApp Business Cloud API Permanent Access Token.
 * 4. A pre-approved Message Template (e.g. order_confirmation) in the WhatsApp Business Manager portal.
 * 
 * Once ready to move to production:
 * 1. Configure Grap API endpoint: `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`
 * 2. Add `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` to .env file.
 * 3. Replace the console.log below with an active fetch() call using Bearer authorization headers.
 */

export interface WhatsAppOrderDetails {
  orderId: string;
  itemsSummary: string; // e.g. "Brand of Aura Hoodie (S) x1, Sigil Oversized Tee (M) x2"
  total: number;
  paymentMethod: string;
  shippingAddress: string;
  recipientName: string;
}

export async function sendWhatsAppOrderNotification(
  phoneNumber: string,
  orderDetails: WhatsAppOrderDetails
) {
  // Clean phone number: remove spaces, dashes, parentheses
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');

  // ─── Meta WhatsApp Cloud API Payload Structure ───────────────────────
  // We model the parameters exactly how the template expects variables.
  const whatsappApiPayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'template',
    template: {
      name: 'order_confirmation_aura',
      language: {
        code: 'en_US'
      },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: orderDetails.recipientName },
            { type: 'text', text: orderDetails.orderId },
            { type: 'text', text: orderDetails.itemsSummary },
            { type: 'text', text: `₹${orderDetails.total.toLocaleString('en-IN')}` },
            { type: 'text', text: orderDetails.paymentMethod.toUpperCase() },
            { type: 'text', text: orderDetails.shippingAddress }
          ]
        }
      ]
    }
  };

  // Log exactly what WOULD be sent as a visual simulator in console
  console.log('\n==================================================');
  console.log('🟢 [WHATSAPP NOTIFICATION TRIGGERED]');
  console.log(`To Recipient: ${cleanPhone}`);
  console.log(`Payload Sent:`);
  console.log(JSON.stringify(whatsappApiPayload, null, 2));
  console.log('--- Visual Template Message ---');
  console.log(`Hey ${orderDetails.recipientName},`);
  console.log(`Your order ${orderDetails.orderId} at Aura Farming is confirmed!`);
  console.log(`Items: ${orderDetails.itemsSummary}`);
  console.log(`Total Amount: ₹${orderDetails.total.toLocaleString('en-IN')}`);
  console.log(`Payment Mode: ${orderDetails.paymentMethod.toUpperCase()}`);
  console.log(`Coordinates: ${orderDetails.shippingAddress}`);
  console.log(`Born Cursed. Worn Proud. Thank you for walking the path.`);
  console.log('==================================================\n');

  // Placeholder return matching successful call signature
  return { success: true, messageId: `wam.ID-${Date.now()}` };
}
