# 🚗 Electric Vehicles Charging Station Management ⚡🔋

## 🚀 Introduction
This project is a **web application** for managing **electric vehicle charging stations**. It helps users find nearby charging stations, manage their favorite stations, and plan their routes efficiently. 

🔨 **Status**: 🚧 *Final project still in progress*

## ✨ Features
- 🔑 **User Authentication**: Registration, login, email verification, and password reset.
- 🗺️ **Map Integration**: Display stations on an interactive **OpenStreetMap**.
- ⭐ **Favorites Management**: Like/unlike stations and store them.
- 🏠 **Personal Area**: Manage personal details and saved stations.
- 📡 **Real-time API Integration**: Retrieve live station data.
- 🔒 **Secure**: JWT-based authentication & bcrypt for password hashing.



## 🛠️ Tech Stack
### 🎨 Frontend
- **React.js** with React Router.
- **Axios** for API communication.
- **CSS & FontAwesome** for design.

### 🔙 Backend
- **Node.js & Express.js** for API handling.
- **MongoDB & Mongoose** for database storage.
- **jsonwebtoken (JWT)** for authentication.
- **bcryptjs** for password encryption.
- **Nodemailer** for email verification.

### 🌍 APIs
- **OpenStreetMap API** for location-based services.
- **Custom REST API** for user and station management.

## 📥 Installation & Setup
1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/electric-vehicles.git
   cd electric-vehicles
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Setup environment variables:**
   Create a `.env` file in the root directory with the following details:
   ```sh
   PORT=3001
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:3000
   EMAIL=your_email
   EMAIL_PASSWORD=your_email_password
   ```
4. **Start the server:**
   ```sh
   npm start
   ```
5. **Run frontend (if separate repo):**
   ```sh
   cd client
   npm start
   ```

## 📡 API Endpoints
### 🔑 Authentication
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Authenticate and get a token.
- `POST /api/auth/verify-code` - Verify email using code.
- `POST /api/auth/reset-password/:token` - Reset password.

### ⚡ Charging Stations
- `GET /api/stations` - Retrieve all charging stations.
- `POST /api/stations/:id/like` - Like a station.
- `DELETE /api/stations/:id/unlike` - Unlike a station.


