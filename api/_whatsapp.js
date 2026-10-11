// Sends a WhatsApp message to the shop owner's number.
// Uses the CallMeBot WhatsApp API (free, works for your own number).
//
// Required environment variables (set them in Vercel -> Settings -> Environment Variables):
//   WHATSAPP_PHONE   your number with country code, no "+" or spaces, e.g. 201012345678
//   WHATSAPP_APIKEY  the key CallMeBot sends you after you activate it (see README note)
//
// File name starts with "_" so Vercel does NOT expose it as a public API route.

export async function sendWhatsApp(text) {
    const phone = process.env.WHATSAPP_PHONE;
    const apikey = process.env.WHATSAPP_APIKEY;

    if (!phone || !apikey) {
        throw new Error('WHATSAPP_PHONE / WHATSAPP_APIKEY are not configured');
    }

    const url =
        'https://api.callmebot.com/whatsapp.php' +
        `?phone=${encodeURIComponent(phone)}` +
        `&text=${encodeURIComponent(text)}` +
        `&apikey=${encodeURIComponent(apikey)}`;

    const response = await fetch(url);
    if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`WhatsApp send failed (${response.status}): ${body.slice(0, 200)}`);
    }
    return true;
}
