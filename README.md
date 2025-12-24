# Portfolio - Habbo Hotel Style Multiplayer Chatroom

A unique portfolio website with a Habbo Hotel inspired isometric multiplayer chatroom experience. Built with Next.js, React, and PostgreSQL.

## 🎮 Features

- **Isometric Multiplayer Room**: Real-time interactive chat room with Habbo Hotel aesthetics
- **Portfolio Showcase**: Display projects, skills, experience, and about information in interactive modals
- **Mini Games**: 
  - Memory Game
  - Rock Paper Scissors (Suit)
  - Tech Trivia
- **Admin Dashboard**: Full content management system for portfolio data
- **Email System**: Contact form with admin email center using SMTP
- **Mailing List**: Newsletter subscription system
- **Custom Avatar**: Customizable character with different colors and styles

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.9 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Custom Pixel Art CSS
- **Database**: PostgreSQL (Neon/Supabase)
- **Authentication**: Custom admin auth system
- **UI Components**: Radix UI, Custom components
- **Editor**: TinyMCE for rich text editing
- **Email**: Nodemailer with SMTP

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon or Supabase)
- SMTP credentials for email functionality

### Installation

1. Clone the repository
```bash
git clone https://github.com/jamesaja2/portofolio.git
cd portofolio
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:
- Supabase/Neon database URLs and keys
- TinyMCE API key
- Admin credentials for seeding

4. Run database migrations
```bash
npm run db:neon:setup
```

5. Start development server
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
├── app/                      # Next.js app directory
│   ├── admin/               # Admin dashboard
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   └── game/                # Main game/chatroom page
├── components/              # Reusable React components
│   ├── modal-content/      # Portfolio modal contents
│   └── ui/                  # UI component library
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and types
├── public/                  # Static assets
├── scripts/                 # Database migration scripts
└── styles/                  # CSS modules and global styles
```

## 🔐 Security

- All sensitive credentials are stored in environment variables
- `.env.local` is gitignored
- Admin authentication system with JWT tokens
- SQL injection protection with parameterized queries
- Updated to React 19.2.3 and Next.js 15.5.9 (security patches applied)

## 🎨 Customization

### Admin Access
1. Seed admin user with your credentials
2. Visit `/auth/admin-login`
3. Manage content via `/admin` dashboard

### Portfolio Content
All content is managed through the admin dashboard:
- About information
- Projects with tech stack
- Skills with logos
- Work experience
- Contact settings

## 📝 License

MIT License - feel free to use this for your own portfolio!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Built with ❤️ by James Timothy

---

⭐ Star this repo if you found it interesting!
