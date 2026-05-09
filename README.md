# Mukibara Village Announcement System

A mobile web application for village announcements in Kinyarwanda language.

## Features

- **Role-based Authentication**
  - Village Leader: Create, edit announcements
  - Regular Users: View and search announcements only
  - Admin: Full control (create, edit, delete)

- **Announcement Management**
  - Create, edit, and delete announcements
  - Search functionality
  - Persistent data storage using localStorage
  - Kinyarwanda language interface

- **Mobile Design**
  - iPhone-style frame for desktop viewing
  - Responsive mobile-first design
  - Clean, modern interface

## Login Credentials

### Village Leader
- Username: `mukibara`
- Password: `ubuyobozi@123!`

### Regular User
- Username: `mukibara`
- Password: `mukibara@123`

### Admin
- Username: `admin`
- Password: `mukibara@123!`

## Usage

1. Open `index.html` in a web browser
2. Login with appropriate credentials
3. Village Leaders and Admin can click "+ Tangaza" to create announcements
4. All users can search through announcements
5. Data persists automatically in browser localStorage

## Technical Details

- **Frontend**: Pure HTML, CSS, JavaScript
- **No frameworks required**
- **Storage**: Browser localStorage
- **Language**: Kinyarwanda
- **Design**: Mobile-first with iPhone frame mockup

## Deployment

This application can be deployed to any static web hosting service:
- GitHub Pages
- Netlify
- Vercel
- Any static file server

Simply upload the files and access `index.html` to run the application.
