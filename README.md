Feedback System
Overview
This is a web-based feedback system developed for Anantrao Pawar College of Engineering & Research to allow students, teachers, and HODs to log in and provide feedback. The application features a responsive login page, role-based access, and a backend connected to a PostgreSQL database. It is designed to run locally on a college computer within the LAN.
Features

User authentication for students, teachers, and HODs.
Responsive login interface with error handling.
Role-based redirection after login (e.g., /student, /teacher, /hod).
Local hosting on a college LAN using a static IP.
Database management with PostgreSQL.

Technologies Used

Frontend: React, HTML, CSS (Tailwind CSS)
Backend: Node.js, Express
Database: PostgreSQL 17.5
Other Tools: npm, serve (for static hosting)

Installation
Prerequisites

Node.js (LTS version)
PostgreSQL 17.5
Git (for cloning the repository)

Steps

Clone the Repository
git clone https://github.com/DurveshN/Feedback-Form.git
cd your-repo


Install Dependencies

Navigate to the backend folder:cd backend
npm install


Navigate to the frontend folder:cd ../frontend
npm install




Set Up Environment Variables

In the frontend folder, create a .env file:REACT_APP_API_BASE=http://localhost:5000


In the backend folder, update database.js with your PostgreSQL credentials:const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "feedback_system",
  password: "your_password",
  port: 5432,
});
module.exports = pool;




Import the Database

Ensure PostgreSQL is installed and running.
Create the database:"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE feedback_system;"


Import the dump file (e.g., newbackup.dump):"C:\Program Files\PostgreSQL\17\bin\pg_restore.exe" -U postgres -d feedback_system path\to\backup.dump




Run the Application

Start the backend:cd backend
node server.js


Build and serve the frontend:cd ../frontend
npm run build
npm install -g serve
serve -s build -l 3000 --listen 0.0.0.0


Access the app at http://localhost:3000 or http://<college-computer-ip>:3000.



Usage

Log in with valid credentials for students, teachers, or HODs.
After login, users are redirected based on their role.
Provide feedback through the respective dashboards.

Deployment

The app is deployed on a college computer with a static IP (e.g., 192.168.1.45).
Students access it via the LAN using http://<college-computer-ip>:3000.
Ensure ports 3000 (frontend) and 5000 (backend) are open in the firewall.

Team
Created by:
Durvesh Narkhede

Contributing
Feel free to fork this repository and submit pull requests. Please follow the existing code style and include tests where applicable.

Inspired by the need for an efficient feedback system at Anantrao Pawar College of Engineering & Research.

Contact
For issues or questions, please open an issue on this repository or contact durveshnarkhede5769@gmail.com