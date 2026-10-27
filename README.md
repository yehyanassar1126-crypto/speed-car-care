# Speed Car Care 🚗 نظام إدارة مغسلة ومصنع غيار الزيوت

نظام متكامل لإدارة مغسلة ومركز خدمة سيارات Speed Car Care، يشمل واجهة العملاء وحجز الخدمات، ولوحة تحكم الإدارة، وحساب نقاط الولاء، وإدارة المخزون، ونظام التنبيهات الفورية عبر الواتساب والمتصفح.

---

## 📱 إشعارات الواتساب للأدمن (WhatsApp Admin Notifications)

يحتوي النظام على نظام تنبيهات فوري عبر واتساب يرسل تفاصيل أي فاتورة جديدة أو تقييم عميل إلى رقم الأدمن (`01111232340`) تلقائياً مجاناً باستخدام CallMeBot API.

### خطوات التفعيل في دقيقة واحدة:

1. **الحصول على API Key**:
   - احفظ رقم خدمة CallMeBot في جهات اتصال هاتفك:  
     `+34 941 83 07 41` أو `+34 911 98 12 79`
   - أرسل رسالة واتساب للرقم نصها:
     ```text
     I allow callmebot to send me messages
     ```
   - سيرد البوت برمز الـ `apikey` الخاص بك.

2. **إضافة المتغيرات في Vercel**:
   - توجه إلى مشروعك في Vercel ⬅ **Settings** ⬅ **Environment Variables**.
   - أضف المتغيرات التالية:
     - `WHATSAPP_PHONE`: `201111232340`
     - `WHATSAPP_APIKEY`: الكود المستلم من البوت
     - `SUPABASE_URL`: رابط مشروع Supabase
     - `SUPABASE_SERVICE_ROLE_KEY`: مفتاح Service Role
   - اضغط على **Deployments** ثم اختر آخر رفع واضغط **Redeploy**.

---

## 🔔 تنبيهات لوحة الإدارة (`admin.html`)

- **تنبيه صوتي (Audio Chime)**: يصدر صوت رنين واضح عند وصول أي طلب جديد في قائمة الانتظار.
- **إشعارات سطح المكتب والموبايل (Web Push Notifications)**: إشعار فوري بشعار المركز على شاشة القفل أو شريط التنبيهات بمجرد تسجيل طلب جديد.
- **اعتماد بنقرة واحدة**: إمكانية الموافقة الفورية أو الرفض وتحديد طريقة الدفع (كاش، إنستاباي، أورانج كاش، فيزا).

---

## 🛠️ التقنيات المستخدمة
- **Frontend**: HTML5, Vanilla JavaScript, CSS3 Responsive
- **Backend / Serverless Functions**: Node.js على Vercel Serverless Functions (`/api/*`)
- **Database**: Supabase (PostgreSQL)
- **Notifications**: CallMeBot WhatsApp API + Web Audio API + HTML5 Notification API
