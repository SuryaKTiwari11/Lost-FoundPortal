# Lost & Found Portal

## Overview

The Lost & Found Portal is a comprehensive web application designed to help users report, search for, and claim lost or found items. This platform creates a centralized system where community members can easily connect to recover their belongings.

## Features

- **User Authentication**: Secure login and registration system with email verification
- **Item Reporting**: Easy submission of lost or found items with detailed descriptions and image uploads
- **Search Functionality**: Advanced search to find items by category, location, date, etc.
- **Claim Process**: Streamlined process for claiming items with verification steps
- **Matching System**: Intelligent system to match lost items with found items
- **Notifications**: Email alerts for potential matches and claim updates
- **Dashboard**: Personalized user dashboard to manage reports and claims
- **Admin Panel**: For moderators to verify items, process claims, and manage users

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (App Router)
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **File Storage**: Cloudinary for item images
- **Email Service**: Nodemailer for notifications
- **Deployment**: Vercel

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/Lost-FoundPortal.git
   ```
2. Install dependencies:
   ```
   cd Lost-FoundPortal
   npm install
   ```
3. Configure environment variables:

   - Copy `.env.example` to `.env.local` and update the values:

   ```
   cp .env.example .env.local
   ```

   - Required environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for development)
     - `NEXTAUTH_SECRET`: Random string for NextAuth.js encryption
     - `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD`: For email notifications
     - `CLOUDINARY_*`: For image uploads

4. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Register an account or login with your credentials
2. To report a lost item: Navigate to "Report Lost Item" and fill in the details
3. To report a found item: Go to "Report Found Item" and provide information
4. Search the database of items using filters
5. Claim an item by providing proof of ownership
6. Administrators can verify found items and process claims through the admin dashboard

## Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm start`: Start the production server
- `npm run lint`: Run ESLint to check code quality
- `node scripts/test-mongodb-connection.js`: Test MongoDB connection
- `node scripts/test-email-config.js`: Test email configuration

## Admin Access

For admin access, use:

- Email: admin@lostfound.com
- Password: (Set in your .env file as ADMIN_PASSWORD)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any inquiries or issues, please open an issue on this repository or contact the maintainers directly.

## Developers

- Surya Tiwari - 2nd year Thapar University student

---

© 2025 Lost & Found Portal | All Rights Reserved
[Privacy Policy](https://www.privacypolicygenerator.info/live.php?token=S3viBBVvt7noj1oSZz6XdXL9BEwLYmYn)
