# Relationship Status Verification App

[![GitElo](https://gitelo.dev/badge/zacyungblut)](https://gitelo.dev/zacyungblut)

A lightweight social utility that helps couples make their relationship "official" by linking phone numbers. Inspired by the days of being "Facebook official", this app brings back transparency in dating for the modern era.

When two people confirm their relationship, their status (dating, situationship, single, etc.) is visible to others who search their phone number - only if they've opted in. If someone refuses to confirm, that itself is information.

## ✨ Features

- 📱 Phone number–based verification (no names or personal data stored)
- 🔒 Opt-in privacy model (status only shown if both users agree)
- 💔 Real-time updates when relationships start or end
- 🔍 Search limits (free tier + paid upgrades for more lookups)

## 🚀 How It Works

1. A user enters their partner's phone number.
2. Partner receives a link to confirm the relationship.
3. Once confirmed, the status is visible to others who search that number.
4. Statuses can be updated (dating → ended, or "situationship" → "official").

## 🛠️ Tech Stack

- **Backend:** Node.js / Express
- **Database:** PostgreSQL
- **Messaging:** Twilio (for phone verification + SMS links)
- **Frontend:** React Native (iOS/Android)

## ⚖️ Privacy & Ethics

- All users must opt in before their status is shown.
- No names, photos, or unrelated data are exposed.
- Status visibility can be revoked anytime.

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd official

# Install dependencies
npm install

# Start the development server
npm start
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
