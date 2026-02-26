const SibApiV3Sdk = require('@getbrevo/brevo');

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { rating, type, message, customerName, customerPhone } = req.body;

    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = `New Feedback from ${customerName}`;
    sendSmtpEmail.htmlContent = `
        <html>
            <body>
                <h2>New Customer Feedback</h2>
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Phone:</strong> ${customerPhone}</p>
                <p><strong>Rating:</strong> ${rating} Stars</p>
                <p><strong>Type:</strong> ${type}</p>
                <p><strong>Message:</strong> ${message}</p>
            </body>
        </html>`;
    sendSmtpEmail.sender = { "name": "Speed Car Care", "email": "your-email@example.com" }; // Must be a verified email in Brevo
    sendSmtpEmail.to = [{ "email": "YOUR_PERSONAL_EMAIL@GMAIL.COM" }]; // Where you receive the alerts

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
