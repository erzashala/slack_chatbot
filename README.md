# Slack Bot with BambooHR Integration

## Overview
This Slack bot integrates with the BambooHR API to provide real-time information on employee presence, leave status, and office check-ins. Users can use Slack commands to query employee information and receive updates directly within Slack.

## Features
- Query the presence and leave status of a specific employee.
- Check who is currently away from the office.
- Retrieve timesheet entries for employee check-ins.
- Manage errors and provide clear messages in case of issues.

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/erzashala/slack_chatbot.git
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
   Add your BAMBOOHR_API_BASE_URL!
   Create a `.env` file in the project root and add your BambooHR API key:
    ```plaintext
    BAMBOOHR_API_KEY=your_bamboohr_api_key
    ```

5. **Run the server**:
    ```bash
    node index.js
    ```

## Commands

### `/kueshte [employee_name]`
- **Description**: Checks whether a specific employee is present in the office or on leave.
- **Usage**: 
  - `/kueshte Erza Shala`
- **Response**:
  - If the employee is on leave: 
    - `Erza Shala është jashtë zyrës për arsye: Pushim vjetor, nga 2024-09-10 deri më 2024-09-20.`
  - If the employee is not on leave:
    - `Erza Shala duhet të jetë në zyrë, pasi qe nuk ka pushim zyrtar.`
  - If the employee is not found:
    - `Personi me emrin Erza Shala nuk gjindet.`

### `/whoisaway`
- **Description**: Lists all employees who are currently away from the office.
- **Usage**: 
  - `/whoisaway`
- **Response**:
  - If no employees are away:
    - `Të gjithë janë në zyrë sot.`
  - If employees are away:
    - `Punonjësit që janë jashtë zyrës:\nShaqir Topko është jashtë zyrës për arsye: Pushim vjetor, nga 2024-09-01 deri më 2024-09-10.`

### `/checkin`
- **Description**: Retrieves a list of employees who have checked in today.
- **Usage**: 
  - `/checkin`
- **Response**:
  - If no check-ins are found:
    - `Nuk ka hyrje për punonjës që kanë bërë check-in para kësaj kohe.`
  - If check-ins are found:
    - `Punonjësit që kanë bërë check-in:\nErijon Hasi ka bërë check-in më 2024-09-21T08:30:00.`

## Error Handling
The bot includes error management to ensure smooth user experience:
- If the BambooHR API request fails or there are connectivity issues, the bot will return:
  - `Dicka shkoi keq gjatë përpunimit të kërkesës.`
- Invalid or missing employee names will result in:
  - `Personi me emrin [employee_name] nuk gjindet.`

## Configuration

- **BambooHR API Authentication**:
  - This bot interacts with BambooHR via their API. Ensure the `BAMBOOHR_API_KEY` environment variable is properly set.
  
- **Slack Integration**:
  - Configure the commands `/kueshte`, `/whoisaway`, and `/checkin` within Slack with the correct API endpoint to post data to the server.


## Contact
For any issues or questions, please reach out to:
- **Erza Shala** 
- **Shaqir Topko** 
- **Erijon Hasi** 
