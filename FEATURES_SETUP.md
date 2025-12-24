# AI Chatbot & Email Notification - Setup Guide

## 🤖 AI Chatbot Feature

### Overview
The AI chatbot is powered by Google Gemini 1.5 Flash and provides 24/7 automated assistance to visitors. It can answer questions about:
- Your projects and technologies
- Your skills and expertise  
- Your work experience
- Website features
- Contact information

### Setup Steps

1. **Get Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Get API Key" or "Create API Key"
   - Copy the generated API key

2. **Add to Environment**
   ```bash
   # .env.local
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Restart Development Server**
   ```bash
   npm run dev
   ```

### Features
- **Floating Button**: Appears on all pages (bottom-right corner)
- **Draggable Window**: Desktop users can drag the chat window
- **Mobile Responsive**: Full-screen chat on mobile devices
- **Rate Limiting**: 10 messages per hour per IP address
- **Context-Aware**: AI knows all your portfolio data in real-time

### API Endpoints
- `GET /api/ai/context` - Exposes portfolio data for AI
- `POST /api/ai/chat` - Handles chat messages with rate limiting

### Rate Limits
- **10 messages per hour** per IP address
- Resets automatically after 1 hour
- Prevents abuse and controls API costs

### Customization
Edit the system instruction in `app/api/ai/chat/route.ts`:
```typescript
const systemInstruction = `You are a helpful AI assistant...`
```

---

## 📧 Email Notification Feature

### Overview
When visitors submit the "Get in Touch" form, an automatic email notification is sent to your email address with the form details.

### Setup Steps

1. **Configure SMTP Settings**
   - Login to admin panel: `/auth/admin-login`
   - Navigate to "Email Center" tab
   - Fill in your SMTP server details:
     - **Host**: Your SMTP server (e.g., smtp.gmail.com)
     - **Port**: Usually 587 (TLS) or 465 (SSL)
     - **Username**: Your email address
     - **Password**: Your email password or app password
     - **Secure**: Enable for SSL/TLS

2. **Gmail Setup (Recommended)**
   - Use Gmail SMTP: `smtp.gmail.com`
   - Port: `587` with TLS enabled
   - Username: Your Gmail address
   - Password: Create an [App Password](https://myaccount.google.com/apppasswords)
     - Go to Google Account → Security
     - Enable 2-Step Verification
     - Generate App Password for "Mail"
     - Use that password in SMTP settings

3. **Test Configuration**
   - In Email Center, click "Test Email"
   - Check if you receive the test email
   - If successful, notifications will work automatically

### Email Content
When a visitor submits the contact form, you receive:
- Visitor's name
- Visitor's email address
- Their message
- Timestamp (automatic)

### Notification Email Address
Emails are sent to: `jamestimothyaja@gmail.com`

To change this, edit `app/api/contact/route.ts`:
```typescript
await transporter.sendMail({
  to: "your_email@example.com", // Change here
  // ...
})
```

### Troubleshooting

**Emails not sending?**
1. Check SMTP settings in admin panel
2. Verify SMTP credentials are correct
3. For Gmail:
   - Ensure 2FA is enabled
   - Use App Password, not regular password
   - Enable "Less secure app access" if needed
4. Check server logs for error messages

**Rate limiting on SMTP?**
- Gmail allows 500 emails per day
- Use a professional SMTP service for high volume

---

## 🔐 Security Notes

### API Keys
- Never commit `.env.local` to git (already in `.gitignore`)
- Gemini API key is server-side only (not exposed to client)
- SMTP credentials stored securely in database

### Rate Limiting
- AI chat: 10 messages per hour per IP
- Prevents API abuse
- Can be adjusted in `app/api/ai/chat/route.ts`

### Production Recommendations
1. **Use Redis for rate limiting** (current: in-memory)
2. **Set up monitoring** for API usage
3. **Configure CORS** properly
4. **Use environment-specific keys** (dev vs prod)

---

## 💰 Costs

### Gemini API (Free Tier)
- **1,500 requests per day** (free)
- **60 requests per minute**
- More than enough for portfolio site
- Upgrade to paid if needed

### SMTP
- **Gmail**: Free (500 emails/day)
- **SendGrid**: Free tier available
- **Mailgun**: Free tier available

---

## 📊 Monitoring Usage

### Check AI Usage
Visit [Google AI Studio](https://aistudio.google.com/) to monitor:
- API requests count
- Token usage
- Rate limit status

### Check Email Delivery
- View sent emails in your SMTP provider dashboard
- Check contact messages in admin panel

---

## 🎨 Customization

### Chatbot Appearance
Edit `components/ai-chatbot.tsx`:
- Button position and style
- Window dimensions
- Colors and branding
- Welcome message

### Email Template
Edit `app/api/contact/route.ts`:
- Email subject line
- HTML template
- Recipient address
- Additional fields

---

## 🆘 Support

If you encounter issues:
1. Check browser console for errors
2. Review server logs
3. Verify all environment variables are set
4. Test SMTP connection separately
5. Check Gemini API quota

For Gemini API issues: [Google AI Documentation](https://ai.google.dev/docs)
For SMTP issues: Check your email provider's documentation
