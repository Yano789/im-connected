# Elements of Software Engineering 50.003 2025 Project
## Group 2.4 Cohort 2

## About

## How to run
1. `Clone this repository` and `navigate` to the the folder containing your local copy
2. Change the .env to match your email address
3. run `npm i` to install all the dependencies
4. In VSC or your preffered IDE, `open 2 terminals`. run `npm run start` on one terminal to start the database, and `npm run dev` on the other terminal to load the UI
5. `Sign in` when required as many of the features require authetication

## Features 

### (a) Forum 

### (b) Medicine Scanner + Logger

### (c) AI Chatbot

## Routers 
- `/`, default page, loads splashscreen
- `/signup`, loads sign up page
- `/signin`, loads sign in page
- `/preferences`, loads preferences page
- `/emailauthentication`, for checking your email is valid when first registering an account
- `/forgetpasword`, used to change user's pasword
- `/dashboard`, loads dashboard
- `/forum`, loads forum
- `/forum/newpost`, when users wants to create a post / view drafts / post draft
- `/forum/viewpost`, when user clicks on a certain post to see its contents
- `/forum/mypost`, to see user's posted posts
- `/forum/savedpost`, shows user's saved posts
- `/medication`, to load medicine scanner in 
- `/chatbot`, loads ai chatbot page
- `/profile`, loads profile page

## Unit Tests 
### 1. backend tests
To run a specified backend test, run `npm test <name of test>`.

### 2. frontend test
- To run all frontend test, run `npm run frontendtest`
- To run a specific frontend test, run `npm run frontendtest -- -t="<name of test>"`


