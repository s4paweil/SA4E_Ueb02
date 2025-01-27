# SA4E_Ueb02
Second Project for Software Architectures for Enterprises. WiSe24/25.


# Christmas Wishes Microservices Prototype

This repository contains a prototype for a Christmas Wishes system. It demonstrates a microservices-based architecture to manage and process Christmas wishes. The system includes multiple components, such as wish submission services, an admin dashboard, a Camel-based integration for scanned wishes, and a MongoDB database.

---

## **Features**
- **Load Balancer (NGINX):** Distributes incoming requests across multiple wish-service instances.
- **Wish-Services (Node.js):** Allows users to submit Christmas wishes with their names.
- **MongoDB:** Central database to store wishes and their statuses.
- **Camel Integration:** Processes scanned wish files from a directory and inserts them into the database.
- **Admin Service (Node.js):** Web-based dashboard to view wishes and update their statuses.

---

## **Requirements**
- **Docker** and **Docker Compose** (Latest versions recommended)
- Ports **80**, **3000**, **3001**, and **4000** must be available on your system.

---
## **Setup and Usage**

### **1. Clone the Repository**
```bash
git clone https://github.com/your-repository-url.git
cd your-repository
```

### **2. Build and Run the Project**
```bash
docker compose up --build -d
```
This will start:
- NGINX Load Balancer (http://localhost/)
- 2 x Wish-Service (Node.js, Port 3000)
- MongoDB Database (mongodb://mongo:27017/xmas_wishes)
- Camel Integration (Processes scanned wish files from `scanned_letters/`)
- Admin-Service (http://localhost:4000/)

### **3. Interact with the System**
#### Submit Wishes
- Acces the main interface at http://localhost/
- Enter your name and wish, then click "Submit Wish"
#### View Wishes and Update Status
- Acces the admin interface at http://localhost:4000/
- View all wishes in the database
- Change status of a wish using the dropdown menu
#### Add Scanned Wishes
There are already two exampels for Scanned Wishes in the `scanned_letters/` folder.
You can add more using the following scheme.
```txt
First Line contains Name.
Second Line contains the Wish.
```

### **4. Stopping the Service**
To stop all services use
```bash
docker compose down
```