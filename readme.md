# Habit Management App

## Overview
A web application that allows users to manage and track their habits effectively, providing functionality to create habits, record progress, and add notes for each entry.

*This project is for practicing database creation with Node.js. *

&nbsp;
## Used Modules

- **Node.js**
- **Express**
- **EJS**
- **Express-session**
- **Cookie-parser**
- **Moment**
- **Nodemon**
- **SQLite3**

&nbsp;
&nbsp;

## Project Requirements
<details>
<summary>한국어 (korean)</summary>
<div markdown="1">
- 회원가입 및 로그인 기능
- 회원 별로 습관을 관리 해야 한다.
- 습관 목록을 조회할 수 있어야 하고, 습관을 추가할 수 있어야 한다
- 습관 별로 기록을 관리할 수 있어야 한다.
- 습관 기록에는 메모를 할 수 있는 기능이 필요하다.

</div>
</details>

### 1. User Authentication
- Implement user registration and login functionality.

### 2. Habit Management
- Users can manage their own habits.
- Users can view a list of their habits.
- Users can add new habits.

### 3. Habit Tracking
- Users can manage records for each habit.
- The habit tracking feature includes a memo functionality for each record.

&nbsp;





&nbsp;



# Entity-Relationship Diagram


![draw.io](image-3.png)

``` mermaid

erDiagram
    USERS ||--o{ HABITS : has
    HABITS ||--o{ RECORDS : contains

    USERS {
        integer id PK
        varchar name
        varchar email UK
        varchar password
        datetime createdAt
    }

    HABITS {
        integer id PK
        varchar habit_name
        datetime start_date
        datetime end_date
        datetime createdAt
        integer user_id FK
    }

    RECORDS {
        integer id PK
        varchar memo
        datetime createdAt
        integer habit_id FK
    }
```



&nbsp;
# Sequence Diagram
``` mermaid
sequenceDiagram
    actor User
    participant Client
    participant Express
    participant SQLite
    
    %% Authentication Flow
    rect rgb(240, 240, 240)
        Note over User,SQLite: Authentication Flow
        User->>Client: Access /register
        Client->>Express: GET /register
        Express->>Client: Render register form
        User->>Client: Submit registration
        Client->>Express: POST /register
        Express->>SQLite: Check email existence
        SQLite-->>Express: Return result
        alt Email exists
            Express-->>Client: Show error
        else Email doesn't exist
            Express->>SQLite: Insert new user
            Express->>Client: Redirect to login
        end

        User->>Client: Access /login
        Client->>Express: GET /login
        Express->>Client: Render login form
        User->>Client: Submit credentials
        Client->>Express: POST /login
        Express->>SQLite: Verify credentials
        SQLite-->>Express: Return user data
        alt Valid credentials
            Express->>Express: Create session
            Express->>Client: Redirect to habit list
        else Invalid credentials
            Express->>Client: Redirect to login
        end
    end

    %% Habit Management Flow
    rect rgb(230, 240, 230)
        Note over User,SQLite: Habit Management Flow
        User->>Client: Access habit list
        Client->>Express: GET /habit_list
        Express->>SQLite: Query user's habits
        SQLite-->>Express: Return habits
        Express->>Client: Render habit list

        User->>Client: Add new habit
        Client->>Express: POST /habit/add
        Express->>SQLite: Insert new habit
        SQLite-->>Express: Confirm insertion
        Express->>Client: Redirect to habit list

        User->>Client: View habit details
        Client->>Express: GET /habit_list/:id
        Express->>SQLite: Query habit & records
        SQLite-->>Express: Return habit data
        Express->>Client: Render habit details

        User->>Client: Add habit record
        Client->>Express: POST /habit_record_add
        Express->>SQLite: Insert record
        SQLite-->>Express: Confirm insertion
        Express->>Client: Redirect to habit details
    end
```

&nbsp;

# UI Design & Prototype
<details>
<summary>korean</summary>
<div markdown="1">


![alt text](image-1.png)
* [프로토타입 보기 (KR)](https://whimsical.com/habit-web-THkqG3nynXrMxTGv31HkAd)

* [요구사항 명세서 pdf](habbit-requirement.pdf)


</div>
</details>
&nbsp;

![alt text](image-2.png)
* [view prototype (EN)](https://whimsical.com/habit-web-eng-Fq6SJpY2R9dFP3CX86zYcD@or4CdLRbgroUYs7q3E5gZn2vyaZihJaovEpzuq9dR)

&nbsp;

## Installation
1. Clone the repository
~~~bash
git clone https://github.com/est22/habit_web
~~~
2. Navigate to the project directory:
~~~bash
cd habit-management-app
~~~
3. Install dependencies:
~~~bash
npm i express ejs express-session cookie-parser moment nodemon
~~~
4. Start the application: 
~~~bash
npm run dev
~~~

&nbsp;
&nbsp;

