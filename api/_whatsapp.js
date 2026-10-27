// Sends a WhatsApp message to the shop owner's number.
// Uses the CallMeBot WhatsApp API (free, works for your own number).
//
// Required environment variables (set them in Vercel -> Settings -> Environment Variables):
//   WHATSAPP_PHONE   your number with country code, no "+" or spaces, e.g. 201111232340 (defaults to 201111232340)
//   WHATSAPP_APIKEY  the key CallMeBot sends you after you activate it (see README note)
//
// File name starts with "_" so Vercel does NOT expose it as a public API route.

export async function sendWhatsApp(text) {
    let phone = process.env.WHATSAPP_PHONE || '201111232340';
    const apikey = process.env.WHATSAPP_APIKEY;

    // Clean phone number: remove spaces, +, -, parentheses
    phone = String(phone).trim().replace(/[\s\+\-\(\)]/g, '');
    // If entered as Egyptian local format (01xxxxxxxxx), prepend 20
    if (phone.startsWith('01') && phone.length === 11) {
        phone = '20' + phone.slice(1);
    }

    if (!apikey) {
        throw new Error('WHATSAPP_APIKEY is not configured in Vercel environment variables');
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
