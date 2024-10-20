
<p align="center">
    <h1 align="center">DOCTALKER__BACKEND.GIT</h1>
</p>
<p align="center">
    <em>Unleashing Endless Capabilities!</em>
</p>

<br>

#####  Table of Contents

- [ Overview](#-overview)
- [ Features](#-features)
- [ Repository Structure](#-repository-structure)
- [ Modules](#-modules)
- [ Getting Started](#-getting-started)
    - [ Prerequisites](#-prerequisites)
    - [ Installation](#-installation)
    - [ Usage](#-usage)
    - [ Tests](#-tests)
- [ Project Roadmap](#-project-roadmap)
- [ Contributing](#-contributing)
- [ License](#-license)
- [ Acknowledgments](#-acknowledgments)

---

##  Overview

DocTalker__Backend.git is a comprehensive backend project that powers the DocTalker application, providing a secure and efficient environment for user authentication, chat management, document processing, and feedback handling. With RESTful API support, it enables operations like user creation, chat interactions, and document extractions. Centralized controllers streamline user interactions, while models ensure structured data management for chats, feedback, OTP verification, and payments. Through services like AI text generation, secure email communications, and cloud storage integration, DocTalker__Backend.git delivers a robust platform for enhancing user experience and document handling.

---

##  Features

|    |   Feature         | Description |
|----|-------------------|---------------------------------------------------------------|
| ⚙️  | **Architecture**  | Node.js backend architecture utilizing Express for RESTful API, MongoDB for data storage, and integration with AWS services for storage and email functionalities. Implements Google OAuth2.0 for user authentication. |
| 🔩 | **Code Quality**  | Well-structured codebase with organized controllers, routes, models, and services. Utilizes error handling middleware for robust application stability. |
| 📄 | **Documentation** | Extensive inline documentation with detailed explanations of controllers, models, services, and utilities. Lacks external API documentation. |
| 🔌 | **Integrations**  | Integrates with AWS services (S3, SES), Stripe API for payment processing, Google OAuth2.0 for authentication, Hugging Face embeddings, OpenAI, and Google Generative AI for text processing and AI capabilities. |
| 🧩 | **Modularity**    | Modular design with separate files for each controller, route, model, and service, promoting code reusability and maintainability. |
| 🧪 | **Testing**       | Testing frameworks/tools not explicitly mentioned in the provided details. Potentially requires additional information on testing practices. |
| ⚡️  | **Performance**   | Efficient performance supported by rate-limiting, optimized document processing, and AWS services integration for scalable storage. |
| 🛡️ | **Security**      | Secure JWT authentication, password handling, and strict user verification. Utilizes HTTPS, Google OAuth2.0, and Stripe API for secure payment transactions. |
| 📦 | **Dependencies**  | Relies on various external libraries such as Axios, JSONwebtoken, bcrypt, Stripe, Mongoose for MongoDB interactions, and AWS SDK for cloud services integration. |
| 🚀 | **Scalability**   | Scalable architecture with AWS cloud services for storage and email handling. Could benefit from further details on scalability measures and infrastructure setup. |

---

##  Repository Structure

```sh
└── DocTalker__Backend.git/
    ├── README.md
    ├── api.rest
    ├── config
    │   ├── database.js
    │   ├── passport.js
    │   └── s3Config.js
    ├── controllers
    │   ├── authController.js
    │   ├── chatController.js
    │   ├── errorController.js
    │   ├── extractionsController.js
    │   ├── feedbackController.js
    │   ├── handwrittenController.js
    │   ├── paymentController.js
    │   ├── processController.js
    │   ├── queryController.js
    │   ├── testController.js
    │   ├── uploadController.js
    │   └── userController.js
    ├── middlewares
    │   ├── auth.js
    │   ├── idChecks
    │   ├── isAuthorized.js
    │   ├── paymentsCheck.js
    │   └── userChecks
    ├── models
    │   ├── Chat.js
    │   ├── Feedback.js
    │   ├── OTP.js
    │   ├── Payment.js
    │   ├── document.js
    │   └── user.js
    ├── package-lock.json
    ├── package.json
    ├── routes
    │   ├── chatRoute.js
    │   ├── extractionsRoute.js
    │   ├── feedbackRoute.js
    │   ├── handwrittenRoute.js
    │   ├── paymentRoute.js
    │   ├── queryRoute.js
    │   ├── testRoute.js
    │   ├── uploadRoute.js
    │   └── userRoute.js
    ├── services
    │   ├── aws.js
    │   ├── gemini.js
    │   ├── huggingface.js
    │   └── openAi.js
    ├── src
    │   └── app.js
    ├── temp
    │   └── webpage_1710712542368.txt
    └── utils
        ├── appError.js
        ├── catchAsync.js
        ├── cosineSimilarity.js
        ├── emailUtils.js
        ├── emailValidation.js
        ├── extractDataFromDocs.js
        ├── generateOTP.js
        ├── generateToken.js
        ├── getCompletion.js
        ├── pdfToImages.js
        ├── processImages.js
        ├── uploadFile.js
        ├── webScrapper.js
        └── youtubeExtraction.js
```

---

##  Modules

<details closed><summary>.</summary>

| File | Summary |
| --- | --- |
| [api.rest](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/api.rest) | Enables user authentication, user data management, OTP verification, document processing, and chat functionality via RESTful API calls. Supports operations like login, profile updates, password reset, user creation, chat management, and document processing for the DocTalker__Backend.git repository. |
| [package-lock.json](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/package-lock.json) | This code file in the `controllers` directory of the `DocTalker__Backend.git` repository manages the user-related functionalities within the DocTalker application. It orchestrates operations such as user authentication, chat management, feedback handling, payment processing, and more. By centralizing these tasks into a dedicated controller, it ensures efficient and organized handling of user interactions, contributing to the overall functionality and user experience of the application. |
| [package.json](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/package.json) | Orchestrates server execution with key scripts. Manages dependencies for backend operations, including AWS SDK, Express, and MongoDB packages. Facilitates development and production server setups with nodemon and node commands. |

</details>

<details closed><summary>config</summary>

| File | Summary |
| --- | --- |
| [database.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/config/database.js) | Establishes connection to MongoDB, reusing existing connection if available. Handles potential connection errors by logging and exiting Node.js process. Incorporated for future disconnection handling. |
| [passport.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/config/passport.js) | Implements Google OAuth2.0 authentication strategy using Passport. Handles user authentication, creation, and serialization/deserialization. Facilitates user login via Google for the DocTalker backend system. |
| [s3Config.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/config/s3Config.js) | Manages AWS S3 configuration** for the DocTalker__Backend.git repository. Defines region and access credentials for AWS S3 bucket using environment variables. Facilitates secure access to cloud storage services. |

</details>

<details closed><summary>controllers</summary>

| File | Summary |
| --- | --- |
| [authController.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/controllers/authController.js) | Signup, login, OTP actions, password management, and Google authentication. Handles user creation, validation, and token generation, maintaining secure password handling. Includes email notifications and S3 bucket integration. |
| [chatController.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/controllers/chatController.js) | Retrieves, updates, and deletes chat data for a user, as well as allows them to star and un-star messages. Manages chat interactions efficiently, enhancing user engagement and message organization within the DocTalker__Backend application. |
| [errorController.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/controllers/errorController.js) | Handles various database and authentication errors by generating appropriate error messages. Parses and formats error details for response. Centralizes error handling logic for improved maintainability and consistency within the backend repository architecture. |
| [extractionsController.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/controllers/extractionsController.js) | Enables extracting content from webpages or YouTube videos, uploading it to S3 and MongoDB, and creating chat records. Validates URLs, extracts data, uploads files, and manages user interaction, enhancing the document-handling capabilities of the system. |
| [feedbackController.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/controllers/feedbackController.js) | Handles creating and saving feedback messages based on chat interactions. Validates input fields, retrieves chat and message details, then stores the feedback with the associated user ID. |
| [handwrittenController.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/controllers/handwrittenController.js) | Enables uploading Handwritten PDFs, generating images from PDFs, saving document data to the database, and creating a chat entry. Updates user upload count and provides success response. |
| [paymentController.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/controllers/paymentController.js) | Enables creation of checkout sessions and handles successful/cancelled payments using Stripe API.-Populates user data based on subscription level for service access control.-Updates user subscriptions and limits dynamically upon successful payment completion. |
| [processController.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/controllers/processController.js) | Processes and uploads chat documents to MongoDB, extracting and converting text data into chunks using Hugging Face embeddings. Ensures document uniqueness and chat association, handling errors gracefully. |
| [queryController.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/controllers/queryController.js) | Handles user queries, updating chat history and document search for response generation. Utilizes embeddings and cosine similarity for relevance. Generates assistant prompt for context-based question answering. Tracks user query counts. |
| [testController.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/controllers/testController.js) | Generates document chunks from various file types stored in AWS S3. Splits content into manageable pieces for processing. Also contains a test route with authorization. |
| [uploadController.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/controllers/uploadController.js) | Handles uploading single files and folders to S3 and MongoDB. Manages transactions, user updates, and chat creation, enhancing document organization and user experience in the DocTalker Backend repository. |
| [userController.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/controllers/userController.js) | Implements user CRUD operations utilizing catchAsync to handle errors efficiently. Manages updating, deleting, and fetching user information from the database in a secure manner. |

</details>

<details closed><summary>middlewares</summary>

| File | Summary |
| --- | --- |
| [auth.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/middlewares/auth.js) | Verifies user authentication using JWT, fetching user data stored in the database. Sets user data in the request object for authorized access to protected routes within the DocTalker__Backend.git repository. |
| [isAuthorized.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/middlewares/isAuthorized.js) | Validates user subscriptions, upload limits, query allowances, and supported file types based on subscription level. Ensures authorized access with defined subscription tiers. |
| [paymentsCheck.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/middlewares/paymentsCheck.js) | Validates subscription changes based on pricing tiers before allowing user upgrades/downgrades. Introduces error handling for missing products and existing subscriptions. Sets pricing info and product name for subsequent processing. |

</details>

<details closed><summary>models</summary>

| File | Summary |
| --- | --- |
| [Chat.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/models/Chat.js) | Storing messages with roles (user/assistant) and content. |
| [Feedback.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/models/Feedback.js) | Defines a MongoDB schema for storing user feedback in the DocTalker__Backend repository. Tracks user, chat, and message IDs along with feedback messages. Integration includes timestamp and reference to user and chat models. |
| [OTP.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/models/OTP.js) | Defines OTP model with schema for email verification, expiring after 1200 seconds. |
| [Payment.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/models/Payment.js) | Defines payment schema with user, amount, product, session ID, and subscription expiration date fields. Connects to the User collection. Crucial for managing financial transactions within the DocTalker__Backend projects architecture. |
| [document.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/models/document.js) | Defines a schema for storing documents with associated files and processing status. Tracks file details, including text, embeddings, and page numbers. Designed for the DocTalker__Backend.git repository to manage document-related data efficiently. |
| [user.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/models/user.js) | Defines user schema with essential fields like name, email, password, subscription, chats. Includes methods to reset certain values and a pre-save middleware to reset stats at the end of the day. Organized under the models directory in the DocTalker__Backend.git repository. |

</details>

<details closed><summary>routes</summary>

| File | Summary |
| --- | --- |
| [chatRoute.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/routes/chatRoute.js) | Implements chat routes for handling chat-related operations. Ensures authenticated user access and valid user checks. Features include fetching, updating, deleting chats, starring/unstarring messages, and retrieving starred messages. |
| [extractionsRoute.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/routes/extractionsRoute.js) | Enables text extraction from webpages with authentication and user validation. Uses the extraction controller to handle the extraction process, ensuring secure and authorized content retrieval within the DocTalker__Backend.git architecture. |
| [feedbackRoute.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/routes/feedbackRoute.js) | Defines an endpoint /feedbackmessage that requires user authentication and validation. Delegates handling to feedbackController for processing feedback messages extracted from webpages. Facilitates secure and efficient communication within the DocTalker__Backend system. |
| [handwrittenRoute.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/routes/handwrittenRoute.js) | Enables authenticated users to upload handwritten PDFs securely via POST request. Validates upload authorization and triggers the upload process handled by the handwritten controller. Sets the foundation for future feature implementations related to uploading handwritten images. |
| [paymentRoute.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/routes/paymentRoute.js) | Enables payment processing and checkout sessions using Stripe API. Validates user, payment, and ID; handles successful and canceled payment routes. Key features include authentication, middleware validation, and controller functions for payment operations. |
| [queryRoute.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/routes/queryRoute.js) | Handles user queries by processing them with authentication and user validation. Uses controller to manage query processing. |
| [testRoute.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/routes/testRoute.js) | Defines routes for testing the API-Includes endpoints for tests with and without authentication-Utilizes `testController` for handling requests |
| [uploadRoute.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/routes/uploadRoute.js) | Routes file orchestrating file and folder uploads, with authentication and validation checks. Invokes uploadController for file handling and processController for processing. Integrates middlewares for authorization and request validation. |
| [userRoute.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/routes/userRoute.js) | Defines routes for user authentication including login, signup, forget password, and Google OAuth. Allows deleting, updating user profiles, and verifying tokens. Implements OTP verification/resend, password reset, and Google authentication flow. This file plays a pivotal role in managing user authentication and authorization within the system. |

</details>

<details closed><summary>services</summary>

| File | Summary |
| --- | --- |
| [aws.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/services/aws.js) | Upload, delete, list objects, and create folder. Enables file upload to specific folders, deletion, and retrieval. Supports uploading multiple files to a designated folder by a user. |
| [gemini.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/services/gemini.js) | Implements two AI services (text-only and text with image) using Google Generative AI. Handles harmful content with safety settings. Provides functions to generate responses based on input prompts and images. |
| [huggingface.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/services/huggingface.js) | Generates Hugging Face embeddings for documents or queries using an API key. Detects input data type error and supports both single document and array inputs. Major role in text processing within DocTalker__Backend.git. |
| [openAi.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/services/openAi.js) | Facilitates AI-powered text completion using OpenAIs GPT-3.5-turbo model. Utilizes OpenAI API key for generating text completions based on provided prompts. Key contributor to DocTalker__Backends AI capabilities. |

</details>

<details closed><summary>src</summary>

| File | Summary |
| --- | --- |
| [app.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/src/app.js) | Implements secure, rate-limited REST API with error handling for DocTalker__Backend.git. Configures middleware, routes, authentication, and session management. Connects to MongoDB. Starts server upon successful DB connection. |

</details>

<details closed><summary>temp</summary>

| File | Summary |
| --- | --- |
| [webpage_1710712542368.txt](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/temp/webpage_1710712542368.txt) | Summarizes the Democratic Alliance (Portugal, 2024) political party details from the webpage content file. |

</details>

<details closed><summary>utils</summary>

| File | Summary |
| --- | --- |
| [appError.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/utils/appError.js) | Defines custom error handling for HTTP status codes, setting error type based on code prefix. Flags operational errors for stack trace capture. Centralized error management enhances codebase reliability. |
| [catchAsync.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/utils/catchAsync.js) | Facilitates error handling for asynchronous functions in API routes, ensuring any errors are caught and passed to the next middleware. |
| [cosineSimilarity.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/utils/cosineSimilarity.js) | Calculates cosine similarity for vectors in the DocTalker__Backend.git repository. Uses math.js for the computation. |
| [emailUtils.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/utils/emailUtils.js) | Enables sending OTP verification emails using Nodemailer through a configured transporter. Enhances security by utilizing environment variables for email credentials. |
| [emailValidation.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/utils/emailValidation.js) | Validates email format using a regular expression, ensuring compliance with basic email structure for input data across the backend system to enhance data integrity and reliability. |
| [extractDataFromDocs.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/utils/extractDataFromDocs.js) | Extracts text content from various document formats, splitting into manageable chunks with page numbers. Handles image and document files, utilizing loaders for PDF, DOCX, and text formats. Published within utils for document processing in the backend system. |
| [generateOTP.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/utils/generateOTP.js) | Generates a random 6-digit OTP for user authentication using numeric characters. |
| [generateToken.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/utils/generateToken.js) | Generates JWT tokens for authentication using a secret key and expiration time, aiding secure user sessions within the repositorys ecosystem. |
| [getCompletion.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/utils/getCompletion.js) | Implements model selection logic for text completion services from OpenAI and Gemini. Handles different model types based on input, providing corresponding text generation functionalities. |
| [pdfToImages.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/utils/pdfToImages.js) | Generates images from a Word document on S3 by converting pages to image data using a third-party library. Enables extracting and processing images within the DocTalker__Backend repositorys document-related workflows. |
| [processImages.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/utils/processImages.js) | Generates inline data from images URLs by fetching and converting them to base64. Provides support for various image MIME types and handles errors gracefully. Essential for processing images efficiently in the DocTalker__Backend.git architecture. |
| [uploadFile.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/utils/uploadFile.js) | Enables file uploads via multer with memory storage configuration. |
| [webScrapper.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/utils/webScrapper.js) | Extracts text content from a webpage by fetching URL, removing scripts and styles, then returning the trimmed and minified text. |
| [youtubeExtraction.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/utils/youtubeExtraction.js) | Extracts YouTube video transcripts for DocTalkers chat feature using the youtube-transcript' library. |

</details>

<details closed><summary>middlewares.idChecks</summary>

| File | Summary |
| --- | --- |
| [chatCheck.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/middlewares/idChecks/chatCheck.js) | Validates users chat ID against their stored chats to grant access or return an error if not found. |
| [validateStripeID.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/middlewares/idChecks/validateStripeID.js) | Validates existence of a Stripe session ID in the database to authorize payment requests within the DocTalker__Backend repositorys payment flow. |

</details>

<details closed><summary>middlewares.userChecks</summary>

| File | Summary |
| --- | --- |
| [isValid.js](https://github.com/itzSerag/DocTalker__Backend.git/blob/main/middlewares/userChecks/isValid.js) | Validates user verification status before accessing routes; ensures only verified users proceed within the application. |

</details>

---

##  Getting Started

###  Prerequisites

**JavaScript**: `version x.y.z`

###  Installation

Build the project from source:

1. Clone the DocTalker__Backend.git repository:
```sh
❯ git clone https://github.com/itzSerag/DocTalker__Backend.git
```

2. Navigate to the project directory:
```sh
❯ cd DocTalker__Backend.git
```

3. Install the required dependencies:
```sh
❯ npm install
```

###  Usage

To run the project, execute the following command:

```sh
❯ node app.js
```
