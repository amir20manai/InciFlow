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

📸 Application Screenshots

👨‍💼 Admin Dashboard

<img width="1864" height="903" alt="Capture d&#39;écran 2026-09-24 155253" src="https://github.com/user-attachments/assets/77c29752-60bc-4104-bf0e-3ec436a22603" />

👤 Employee Dashboard

<img width="1882" height="904" alt="Capture d&#39;écran 2026-09-24 152702" src="https://github.com/user-attachments/assets/39a44d1e-022c-4733-b8d3-05863fd7f694" />

🛠️ Technician Dashboard

<img width="1889" height="882" alt="Capture d&#39;écran 2026-09-24 160429" src="https://github.com/user-attachments/assets/222a4cac-1231-4134-a40a-4eabc32dadea" />

📝 Incident Reporting

<img width="1887" height="899" alt="Capture d&#39;écran 2026-09-24 154140" src="https://github.com/user-attachments/assets/1144d8e6-2cd0-4371-bcab-26ff4908047e" />

👨‍💻 Developer

Amir Manai

Computer Science Student – Software Engineering

GitHub: @amir20manai

Developed as part of an academic project and further developed for learning and portfolio purposes.
