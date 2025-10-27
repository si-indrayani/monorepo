# 🎮 Gaming Hub App

A modern React-based gaming hub that provides tenant-based game selection and seamless game launching.

## 🚀 Features

- **Multi-Tenant Support**: Choose from different gaming hubs (Sports, Puzzle, Education, Entertainment)
- **Dynamic Game Selection**: Games appear based on selected tenant
- **Modern UI**: Beautiful gradient design with smooth animations
- **Responsive Design**: Works on desktop and mobile devices
- **Game Integration**: Seamlessly launches games in new tabs
- **Event Tracking**: Tracks game selections for analytics

## 🏗️ Architecture

### Tenants & Games Structure

```javascript
const tenants = {
  'TENANT_SPORTS': {
    name: 'Sports Gaming Hub',
    games: {
      'nfl-trivia': { /* game config */ },
      'nba-trivia': { /* game config */ },
      // ...
    }
  },
  // ... other tenants
}
```

### Game Configuration

Each game includes:
- **Name & Description**: Display information
- **Emoji & Visuals**: UI enhancement
- **Difficulty Level**: Easy/Medium/Hard
- **Estimated Time**: Duration guidance
- **URL**: Direct link to deployed game

## 🎯 Available Tenants

### 🏈 Sports Gaming Hub
- NFL Trivia Challenge
- NBA Trivia Masters
- MLB Trivia League

### 🧩 Puzzle Gaming Hub
- Maze Master
- Logic Puzzle Arena
- Word Game Challenge

### 🎓 Educational Gaming Hub
- Science Quiz Adventure
- History Trivia Journey
- Math Challenge Arena

### 🎭 Entertainment Gaming Hub
- Movie Trivia Night
- TV Show Trivia
- Celebrity Puzzle Game

## 🛠️ Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
cd gaming-hub-app
npm install
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
```bash
npm run build
```

## 🔧 Configuration

### Adding New Tenants

1. Add tenant configuration to the `tenants` object in `App.jsx`
2. Include tenant name, description, and games array
3. Each game needs: name, description, emoji, difficulty, estimatedTime, and url

### Adding New Games

```javascript
'nfl-trivia': {
  name: 'NFL Trivia Challenge',
  description: 'Test your NFL knowledge with challenging questions',
  emoji: '🏈',
  difficulty: 'Medium',
  estimatedTime: '5-10 min',
  url: 'https://si-gaming-fantasy.s3.amazonaws.com/trivia/'
}
```

## 🎮 Game Integration

Games are launched in new browser tabs/windows. The hub:
- Tracks game selection events
- Provides loading feedback
- Maintains tenant context

## 📱 Responsive Design

The hub is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🎨 Styling

Built with modern CSS featuring:
- CSS Grid for layouts
- CSS Gradients for backgrounds
- Backdrop filters for glassmorphism effects
- Smooth animations and transitions
- Mobile-first responsive design

## 🔗 Integration with Core Gaming SDK

The gaming hub integrates with the existing Core Gaming SDK by:
- Using the same game URLs
- Maintaining consistent branding
- Providing unified game discovery

## 📊 Analytics

Tracks the following events:
- Tenant selection
- Game selection
- Game launch attempts

## 🚀 Deployment

The app can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3
- GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Core Gaming SDK ecosystem.
