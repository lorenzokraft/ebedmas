**Project Requirements for IXL Clone**

### Overview

The project aims to build an interactive learning platform similar to IXL.com with three key components:

1. **Front-End User Side**
2. **User Backend Side**
3. **Admin Backend**

The platform will facilitate interactive quizzes, user management, and school-specific dashboards. The database will use MySQL, and the tech stack includes Next.js, React, Tailwind CSS, and other relevant technologies.

---

### 1. Front-End User Side

#### Page Structure Skeleton

- **Home Page**

  - Hero section with CTA
  - Features overview
  - Testimonials

- **About Us**

  - Company mission and vision
  - Team introduction

- **Login/Signup**

  - Login form
  - Signup form
  - Password recovery

- **Take a Quiz**

  - Subject and topic selection
  - Quiz interface with:
    - Question display
    - Interactive elements (e.g., drag and drop, text input)
    - Timer and progress bar

- **Contact Us**

  - Contact form
  - FAQ section

---

### 2. Customer Backend Side

#### Page Structure Skeleton

- **Dashboard**

  - User progress overview
  - Recently taken quizzes
  - Upcoming quizzes

- **Subjects**

  - List of subjects and topics
  - Filters by grade and difficulty

- **Quiz Page**

  - Question area
  - Answer submission area
  - Feedback on completion

- **Account Settings**

  - Edit personal details
  - Change password
  - View subscription details

---

### 3. Admin Backend

#### Page Structure Skeleton

- **Admin Dashboard**

  - Total users
  - Total quizzes
  - Platform usage stats

- **User Management**

  - List of users
  - Add/edit/delete user accounts

- **Subject Management**

  - Add/edit/delete subjects
  - Manage topics and questions

- **School Management**

  - Register schools
  - Manage school accounts

- **Reports**

  - Generate analytics
  - Export data to CSV/Excel

---

### Folder Structure Skeleton

```
ixl-clone/
├── frontend/
│   ├── components/
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── QuizComponents/
│   │   │   ├── Question.js
│   │   │   ├── DragAndDrop.js
│   │   │   ├── Timer.js
│   │   └── ...
│   ├── pages/
│   │   ├── index.js (Home Page)
│   │   ├── about.js
│   │   ├── login.js
│   │   ├── quiz/
│   │   │   ├── index.js
│   │   │   ├── [subject].js
│   │   └── contact.js
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.css
│   ├── utils/
│   │   ├── api.js
│   │   └── auth.js
│   └── public/
│       ├── images/
│       └── ...
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── quizController.js
│   │   ├── userController.js
│   │   └── ...
│   ├── models/
│   │   ├── User.js
│   │   ├── Quiz.js
│   │   └── School.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── quizRoutes.js
│   │   ├── userRoutes.js
│   │   └── ...
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── db.js
│   │   └── validators.js
│   └── server.js
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── schema.sql
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── README.md
└── package.json
```

---

### Technology Stack
NextJs
Vite
React
Tailwind CSS
Node.js
Express.js
MySQL
JWT
OAuth 2.0
**Frontend:**

- **Next.js**: For server-side rendering and dynamic routing.
- **React**: For building interactive UI components.
- **Tailwind CSS**: For responsive and modern styling.

**Backend:**

- **Node.js**: For handling server-side logic.
- **Express.js**: For building the REST API.

**Database:**

- **MySQL**: Open-source relational database for storing user data, quizzes, and results.

**Authentication:**

- **JWT (JSON Web Token)**: For secure token-based authentication.
- **OAuth 2.0**: Optional for social logins.
erated content (e.g., drawings).

**Hosting:**

- **Namecheap**: For deploying the application.

---

### Additional Notes

- The developer should implement a modular architecture for scalability.
- Focus on security best practices, such as encrypted passwords and secure API endpoints.
- Provide comprehensive documentation for API endpoints and database schema.
- Integrate optional payment gateways for subscriptions (e.g., Stripe or PayPal).

---

### Deliverables

1. Fully functional front-end and back-end systems.
2. Comprehensive API documentation.
3. Testing reports and bug fixes.
4. Deployment and post-deployment support.

