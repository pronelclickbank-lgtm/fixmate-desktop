# FixMate AI - Intelligent PC Troubleshooting Assistant

**FixMate AI** is a comprehensive Windows PC troubleshooting application with AI-powered chat support, system diagnostics, driver detection, security monitoring, and subscription management.

![FixMate AI Dashboard](https://via.placeholder.com/800x400?text=FixMate+AI+Dashboard)

## Features

### 🔍 System Diagnostics
- **Real-time monitoring**: CPU, memory, and disk usage
- **Startup programs analysis**: Identify high-impact programs slowing boot time
- **Running processes**: Monitor resource-consuming applications
- **Performance bottleneck detection**: Get actionable recommendations

### 🛡️ Security Monitoring
- **Firewall status**: Check if Windows Firewall is enabled
- **Antivirus protection**: Monitor Windows Defender status
- **Windows Update**: Track pending updates
- **Security recommendations**: Get alerts for security issues

### 🚗 Driver Management
- **Driver detection**: Identify outdated drivers
- **Update notifications**: See which drivers need updates
- **Pro feature**: One-click driver updates (Pro subscription only)

### 🤖 AI Chat Assistant
- **24/7 support**: AI-powered troubleshooting assistance
- **Context-aware**: Automatically includes system information
- **Multi-topic**: PC issues, printer problems, and general tech support
- **Powered by SambaNova**: Fast, reliable AI responses

### 💳 Subscription Management
- **Free tier**: Basic diagnostics and limited AI chat
- **Pro tier**: Advanced features, driver updates, priority support
- **License key activation**: Easy activation system
- **Stripe integration ready**: For payment processing

### 👨‍💼 Admin Dashboard
- **Feature flags**: Control which features are enabled
- **App updates**: Manage versions and changelogs
- **User management**: View users and subscriptions
- **License keys**: Generate and manage activation codes
- **Analytics**: Track users, revenue, and usage

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** components
- **tRPC** for type-safe API calls
- **Wouter** for routing
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **tRPC** for API layer
- **Drizzle ORM** for database
- **MySQL** database
- **JWT** authentication
- **SambaNova AI** integration

### Infrastructure
- **Vite** for build tooling
- **Vitest** for testing
- **Manus** for hosting and deployment
- **S3** for file storage

## Getting Started

### Prerequisites

- Node.js 18+ (v22.13.0 recommended)
- pnpm 10+ (package manager)
- MySQL database
- SambaNova API key (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pc-doctor
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   The following environment variables are automatically injected:
   - `DATABASE_URL` - MySQL connection string
   - `JWT_SECRET` - Secret for JWT tokens
   - `SAMBANOVA_API_KEY` - SambaNova AI API key
   - `VITE_APP_TITLE` - Application title
   - `OAUTH_SERVER_URL` - OAuth server URL

4. **Push database schema**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   - Main dashboard: `http://localhost:3000`
   - Admin dashboard: `http://localhost:3000/admin`

### Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
pc-doctor/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and helpers
├── server/                # Backend Node.js application
│   ├── _core/            # Core server functionality
│   ├── routers/          # tRPC routers
│   └── db.ts             # Database connection
├── drizzle/              # Database schema and migrations
│   ├── schema.ts         # Database tables
│   └── migrations/       # Migration files
├── shared/               # Shared types and constants
└── electron/             # Electron app (for Windows installer)
```

## Database Schema

### Core Tables

- **users**: User accounts and authentication
- **subscriptions**: User subscription tiers (free/pro)
- **systemScans**: Diagnostic scan results
- **chatConversations**: AI chat history
- **featureFlags**: Admin-controlled feature toggles
- **appUpdates**: Version management
- **licenseKeys**: Activation codes

## API Routes

### Public Routes
- `diagnostics.getSystemOverview` - Get CPU, memory, disk usage
- `diagnostics.getSecurityStatus` - Get security status
- `diagnostics.getPerformanceBottlenecks` - Get optimization recommendations
- `subscriptions.getFeatureComparison` - Get Free vs Pro comparison

### Protected Routes (Authentication Required)
- `diagnostics.getDriverStatus` - Get driver information
- `diagnostics.runFullScan` - Run system scan
- `chat.sendMessage` - Send message to AI assistant
- `subscriptions.activateLicense` - Activate license key

### Admin Routes (Admin Role Required)
- `admin.featureFlags.*` - Manage feature flags
- `admin.updates.*` - Manage app updates
- `admin.licenses.*` - Generate and manage licenses
- `admin.users.*` - View and manage users

## Windows Installer

FixMate AI can be packaged as a Windows desktop application using Electron.

See [WINDOWS_INSTALLER_GUIDE.md](./WINDOWS_INSTALLER_GUIDE.md) for detailed instructions on:
- Creating a small stub installer (~5-10MB)
- Configuring auto-updates
- Building the full installer
- Distribution options

## Testing

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test chat.sambanova.test.ts

# Run tests in watch mode
pnpm test --watch
```

## Deployment

### Manus Hosting (Recommended)

1. **Save checkpoint**
   ```bash
   # The checkpoint is created through the Manus UI
   ```

2. **Publish**
   - Click the "Publish" button in the Manus Management UI
   - Your app will be deployed with a custom domain

3. **Custom domain**
   - Configure in Settings → Domains
   - Purchase or bind existing domain

### Alternative Hosting

The application can also be deployed to:
- **Vercel** (frontend + serverless functions)
- **Railway** (full-stack deployment)
- **AWS** (EC2 + RDS)
- **DigitalOcean** (App Platform)

## Configuration

### Feature Flags

Control features through the admin dashboard:
- `driver-updates` - Enable driver update functionality (Pro only)
- `advanced-diagnostics` - Advanced system analysis (Pro only)
- `priority-support` - Priority AI chat support (Pro only)

### Subscription Tiers

**Free Tier:**
- Basic system diagnostics
- Security status monitoring
- Driver detection (view only)
- Limited AI chat support
- Performance recommendations

**Pro Tier ($29.99/year):**
- All Free features
- One-click driver updates
- Advanced diagnostics
- Unlimited AI chat support
- Automatic issue fixing
- Scheduled scans
- Priority customer support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: See [WINDOWS_INSTALLER_GUIDE.md](./WINDOWS_INSTALLER_GUIDE.md)
- **Issues**: Report bugs on GitHub Issues
- **Email**: support@fixmate.ai
- **Website**: https://fixmate.ai

## Acknowledgments

- **SambaNova** for AI inference
- **shadcn/ui** for beautiful components
- **Manus** for hosting platform
- **Tailwind CSS** for styling system

## Roadmap

- [x] System diagnostics dashboard
- [x] AI chat assistant
- [x] Subscription management
- [x] Admin dashboard
- [ ] Windows installer
- [ ] Stripe payment integration
- [ ] Automatic driver updates
- [ ] Scheduled scans
- [ ] Email notifications
- [ ] Mobile app (iOS/Android)

---

**Built with ❤️ by the FixMate AI team**
