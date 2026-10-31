InciFlow – Incident Management System

InciFlow is a full-stack web application designed to simplify incident reporting, tracking and management within organizations.

The platform connects employees, administrators and technicians through a centralized system that facilitates incident handling and improves communication.

✨ Features

👤 Employee

Report new incidents.

Attach images and incident details.

Track reported incidents.

Receive notifications about incident updates.

🛠️ Technician

View assigned incidents.

Update incident status.

Track intervention history.

🔐 Administrator

Manage users.

Review and validate reported incidents.

Assign incidents to technicians.

Monitor incident progress.

💻 Technologies

Frontend	Backend	Database
Angular	Java	MySQL
TypeScript	Spring Boot	XAMPP
HTML / CSS	Spring Data JPA	

🏗️ Project Structure

text

InciFlow/

│

├── front/                  # Angular application

│

├── backend/

│   └── inciflow_backend/   # Spring Boot API

│
├── application capture/    # Project screenshots

│

└── README.md

⚙️ Installation and Setup
1. Clone the repository
bash
git clone https://github.com/amir20manai/InciFlow.git
cd InciFlow

2. Configure the database
Start MySQL using XAMPP.
Create the InciFlow database.
Configure database credentials in the Spring Boot application.
3. Run the Backend

Open the backend project in IntelliJ IDEA and run the Spring Boot application.

4. Run the Frontend
bash
cd front
npm install
ng serve


Open your browser:

text
http://localhost:4200

🎯 Project Objective

InciFlow aims to provide an organized and efficient solution for handling workplace incidents, from initial reporting to final resolution.

👨‍💻 Developer

Amir Manai

Computer Science Student – Software Engineering

GitHub: @amir20manai

Developed as part of an academic project and further developed for learning and portfolio purposes.
