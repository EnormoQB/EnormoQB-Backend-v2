# EnormoQB

[EnormoQB](https://enormoqb.tech/) is a crowd-sourced question bank developed as a part of [Smart India Hackathon 2022](https://sih.gov.in/) for Department of School Education & Literacy (DoSEL), Ministry of Education.

<img width="1440" alt="Screenshot 2022-08-20 at 12 13 20 AM" src="https://user-images.githubusercontent.com/75029142/185686385-7e653bb2-91ff-456e-9001-6c940f8b89ad.png">

<Br/>

# Table of Contents

- [Problem Statement](#ps)
- [Inspiration](#inspiration)
- [Solution](#solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Setup Guide](#setup)
- [Working Model Screenshots](#working-model-ss)

<a id="ps"></a>

# Problem Statement

To be able to graduate to objective type questions for one semester of online board exams, a question bank of at least 5000 questions will be required for each subject. Setting question papers for the exams is a complicated task. Can you think of a Crowd Sourcing model where questions are set by large number of anonymous stakeholders thereby creating a large question bank? These questions can be vetted by experts before freezing the same in the question bank. The actual question paper can be set through an automated system.

<a id="inspiration"></a>

# Inspiration

As we all know setting question papers for the board exams is not an easy task. The following are the drawbacks of the existing board paper setting system:

1. It takes a lot of time to manually find and add questions to the question papers of each subject which leads to a prolonged process.
2. Another drawback to the existing way is that it requires manpower and unnecessary storage space for the management of previously generated question papers, which is difficult in the longer run.
3. Also, Due to the changing environment of examinations in the light of ongoing events, there emerged a need to develop multiple question papers for a single academic year.

We decided to build to work on this problem statemnet to overcome these drawbacks and make examination system better in India.

<a id="solution"></a>

# Solution

You don't have to worry because board question papers have a new QB introducing EnormoQB. We came up with an eco-friendly and easy solution to generate question papers for the board exams from the ocean of questions created by the contribution of some brilliant teachers. EnormoQB is advancing the traditional board paper setting system in the following way:

1. The generated crowdsourcing model can help us to create a hassle-free and quality question paper with the input of all the brilliant minds around the world.
2. The genre of the application not only focuses on a particular use case but can be extended to any format according to the need of the examination.
3. From practice set to actual exam set, every other question paper can be set through an automated system in no time.
4. There are currently no existing solutions that can automate the question paper generation for Board Exams with a large question bank.

<a id="features"></a>

# Features

- Unified website with different privileges (Admin / Reviewer / Exam-setter / Contributor).

- For Admin

  - Maintain the question bank.
  - Assign and change roles.
  - Has all access rights.

- For Reviewer

  - Review submitted questions and give feedback on rejection.
  - Freeze spam user's account.
  - Contribute questions like any other contributor.
  - Request contributions in topics having less number of questions.

- For Exam-setter

  - Have all rights of a reviewer.
  - Generate question papers through an automatic system.
  - The permission to generate the paper will be valid for 48 hours and after that exam setter's role will get demoted to the reviewer by the admin.
  - View and download the previously generated question papers.
  
- For Contributor
  - Contribute questions via a form.
  - Manage their pending, rejected, and approved questions(View/Delete).
  - View previous year's papers.
  - Be rewarded for contributions through EnormoQB points system.

<a id="tech-stack"></a>

# Tech Stack

- ReactJs
- Redux + RTK Query
- NodeJs
- ExpressJs
- MongoDB
- Docker
- Docker Compose
- Redis
- Natural Language Processing(NLP)
- Python
- Amazon Web Services(AWS)

<a id="setup"></a>

# Project Setup Guide

## Frontend

1. Clone EnormoQB-Frontend-v2 repo and install dependencies

   ```sh
   git clone https://github.com/EnormoQB/EnormoQB-Frontend-v2.git
   cd EnormoQB-Frontend-v2
   npm i
   ```

2. Copy .env.example content to .env

   ```sh
   cp .env.example .env
   ```

3. Start the react app

   ```sh
   npm start
   ```

## Backend

1. Add .env in the root directory. Here's an example env file for you.

   ```sh
   MONGODB_URL
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   GOOGLE_REFRESH_TOKEN
   SMTP_PASSWORD
   CLIENT_URL
   SECRET
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   AWS_ENDPOINT
   S3_BUCKET
   ADMIN_EMAIL
   ADMIN_PASSWORD
   NODE_ENV
   BASE_PATH
   SIMILARITY_API
   ```

2. Start the backend server

   ```sh
   npm run dev
   ```

<a id="working-model-ss"></a>

# Working Model Screenshots

![image](https://user-images.githubusercontent.com/61985499/186919490-ede1174d-9390-4c68-8881-844c8ddc2b2d.png)

<br />

![screencapture-enormoqb-tech-anonymously-2022-08-26-19_24_26](https://user-images.githubusercontent.com/61985499/186919678-dcd6b0cc-a4e5-4812-a8fc-c595c6395c93.png)

<br />

![image](https://user-images.githubusercontent.com/61985499/186920522-68ddbd30-c539-4738-b7e8-f8b75feaf29a.png)

<br />

![image](https://user-images.githubusercontent.com/61985499/186920944-222c5f8b-6f52-47bf-8af1-a53789047a02.png)

<br />

![image](https://user-images.githubusercontent.com/61985499/186921049-c7549af1-3d91-4aa6-924d-d52a5341ddf1.png)

<br />

![image](https://user-images.githubusercontent.com/61985499/186921209-8e579cca-48f8-410e-9c5b-9eb3fcdbfead.png)

<br />

![image](https://user-images.githubusercontent.com/61985499/186921555-07fe95f7-6b47-4b74-975a-d6ee4eb74ae1.png)

<br />

![image](https://user-images.githubusercontent.com/61985499/186921679-ba018d90-5596-4af1-930b-9454155ea8db.png)

<br />

![image](https://user-images.githubusercontent.com/61985499/186921780-bcdaed21-a8c4-4c31-a948-f6613c383de3.png)
