import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// Format Indian phone number for WhatsApp
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  let clean = phone.replace(/\D/g, "");

  if (clean.length === 10) return `+91${clean}`;
  if (clean.length === 12 && clean.startsWith("91")) return `+${clean}`;
  if (phone.startsWith("+")) return phone;
  return `+91${clean}`;
};

//  Always wrap numbers with whatsapp: prefix
const toWA = (number) => `whatsapp:${number}`;

// Send WhatsApp message
export const sendWhatsApp = async (to, message, contentType = "text") => {
  try {
    const formattedNumber = formatPhoneNumber(to);
    if (!formattedNumber) {
      console.log("Invalid phone number:", to);
      return { success: false, error: "Invalid phone number" };
    }

    const fromWA = toWA(process.env.TWILIO_WHATSAPP_FROM); // whatsapp:+14155238886
    const toWANumber = toWA(formattedNumber); // whatsapp:+91XXXXXXXXXX

    console.log("========== SENDING WHATSAPP ==========");
    console.log(`To:   ${toWANumber}`);
    console.log(`From: ${fromWA}`);
    console.log(`Type: ${contentType}`);
    console.log("=====================================");

    let response;

    if (contentType === "template") {
      response = await client.messages.create({
        contentSid: process.env.TWILIO_TEMPLATE_SID,
        from: fromWA,
        to: toWANumber,
        contentVariables: JSON.stringify({ 1: message }),
      });
    } else {
      response = await client.messages.create({
        body: message,
        from: fromWA,
        to: toWANumber,
      });
    }

    console.log("FROM VALUE:", JSON.stringify(process.env.TWILIO_WHATSAPP_FROM));
console.log("FROM WITH PREFIX:", `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`);

    console.log(" WhatsApp sent:", response.sid);
    return { success: true, sid: response.sid };


  } catch (error) {
    console.error(" Error sending WhatsApp:", error.message);
    console.error("Error code:", error.code);
    console.error("More info:", error.moreInfo);
    return { success: false, error: error.message, code: error.code };
  }
};

// Function to send first message with template
export const sendWhatsAppFirstMessage = async (to) => {
  const firstMessage =
    "Welcome to RepairWalla! 🛠️\n\nReply with:\n1️⃣ To browse services\n2️⃣ To check bookings\n3️⃣ For support";
  return sendWhatsApp(to, firstMessage, "template");
};

// WhatsApp Message Templates (simplified without special formatting)
export const whatsappTemplates = {
  bookingConfirmation: (userName, booking) => `
RepairWalla 🛠️

Hello ${userName}! Your booking has been confirmed.

Service: ${booking.service_name}
Provider: ${booking.provider_name}
Date: ${new Date(booking.booking_date).toLocaleDateString()}
Time: ${booking.booking_time || "To be confirmed"}
Amount: ₹${booking.price}

Track: http://localhost:5173/my-bookings
`,

  bookingStatusUpdate: (userName, booking) => `
RepairWalla 🛠️

Hello ${userName}! Your booking status has been updated.

Service: ${booking.service_name}
Status: ${booking.status.toUpperCase()}

Details: http://localhost:5173/bookings/${booking.id}
`,

  newBookingRequest: (providerName, booking) => `
RepairWalla 🛠️

Hello ${providerName}! New booking request!

Service: ${booking.service_name}
Customer: ${booking.user_name}
Date: ${new Date(booking.booking_date).toLocaleDateString()}
Amount: ₹${booking.price}

Accept/Reject: http://localhost:5173/provider/queue
`,

  providerApproval: (providerName) => `
RepairWalla 

Congratulations ${providerName}! 

Your provider account has been APPROVED! You can now start accepting bookings.

Dashboard: http://localhost:5173/dashboard/provider
`,

  providerRejection: (providerName, reason) => `
RepairWalla 

Hello ${providerName},

Your provider application has been REJECTED.

Reason: ${reason}

Please update: http://localhost:5173/provider/profile
`,
};

// Send WhatsApp functions
export const sendWhatsAppBookingConfirmation = async (user, booking) => {
  if (!user?.phone) {
    console.log("No phone number for user:", user?.email);
    return { success: false, error: "No phone number" };
  }
  return sendWhatsApp(
    user.phone,
    whatsappTemplates.bookingConfirmation(user.name, booking),
  );
};

export const sendWhatsAppBookingStatusUpdate = async (user, booking) => {
  if (!user?.phone) return { success: false, error: "No phone number" };
  return sendWhatsApp(
    user.phone,
    whatsappTemplates.bookingStatusUpdate(user.name, booking),
  );
};

export const sendWhatsAppNewBookingRequest = async (provider, booking) => {
  if (!provider?.phone) return { success: false, error: "No phone number" };
  return sendWhatsApp(
    provider.phone,
    whatsappTemplates.newBookingRequest(provider.name, booking),
  );
};

export const sendWhatsAppProviderApproval = async (provider) => {
  if (!provider?.phone) return { success: false, error: "No phone number" };
  return sendWhatsApp(
    provider.phone,
    whatsappTemplates.providerApproval(provider.name),
  );
};

export const sendWhatsAppProviderRejection = async (provider, reason) => {
  if (!provider?.phone) return { success: false, error: "No phone number" };
  return sendWhatsApp(
    provider.phone,
    whatsappTemplates.providerRejection(provider.name, reason),
  );
};
