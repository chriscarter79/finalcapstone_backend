# Thinkful-Final-Capstone: Restaurant Reservation System   

## Live Demo
[Restaurant Reservation System](https://final-capstone-reservations-fe.herokuapp.com/dashboard "Restaurant Reservation System")      



## Project Summary
A Restaurant Reservation System that is used to keep track of guest reservations and table assignments.  
The user can create new reservations and search reservations by phone number.  
and also keep track of where reservations are seated and occupied tables.

### The Dashboard
![Image of Dashboard](./images/DashboardNoRes.png)
### Dashboard with Reservation
![Image of Dashboard with Reservations](./images/DashboardWithRes.png)
### Dashboard with Seated Reservation
![Image of Dashboard with Seat Reservation](./images/DashboardWithResSeated.png)
### Create new Reservation
![Image of New Reservation](./images/NewReservationScreen.png)
### Create new Table
![Image of New Table](./images/NewTable.png)
### Searh for Reservation
![Image of Reservation Search](./images/SearchRes.png)


## Tech Stack
This web app was developed using HTML, CSS, JavaScript, BootStrap, React, Express, Node, PostgreSQL, and Knex.

## API Documentation

| Route       | Method      | Status Code | Description   |
| :---        |    :----:   |     :----:   |        ---:  |
| /reservations      | GET   | 200  | Returns a list of reservations for the current date |
| /reservations?date=####-##-##      | GET |  200    | Returns a list of reservations for the given date |
| /reservations      | POST  | 201    | Creates a new reservation |
| /reservations/:reservation_id      | GET  | 200     | Returns the reservation for the given ID |
| /reservations/:reservation_id      | PUT  | 200     | Updates the reservation for the given ID |
| /reservations/:reservation_id/status      | PUT  | 200     | Updates the status of the reservation for the given ID |
| /tables   | GET  | 200      | Returns a list of tables     |
| /tables   | POST  | 201      | Creates a new table     |
| /tables/:table_id   | GET   |   200   | Returns the table for the given ID     |
| /tables/:table_id/seat   | PUT | 200      | Seats a reservation at the given table_id     |
| /tables/:table_id/seat   | DELETE  | 200      | Changes the occupied status to be unoccupied for the given table_id     |


 ### Reservation JSON Example
 ```json
{
    "reservation_id": 7,
    "first_name": "Sarah",
    "last_name": "Connor",
    "mobile_number": "6785551234",
    "status": "booked",
    "reservation_date": "2021-09-03T04:00:00.000Z",
    "reservation_time": "21:00:00",
    "people": 3,
    "created_at": "2021-09-03T20:19:16.754Z",
    "updated_at": "2021-09-03T20:19:16.754Z"
}
```

### Table JSON Example
 ```json
{
   "table_id": 1,
    "table_name": "#1",
    "capacity": 6,
    "occupied": false,
    "reservation_id": null,
    "created_at": "2021-09-02T21:43:17.773Z",
    "updated_at": "2021-09-02T21:43:17.773Z"
}
```
## Installation
To install dependencies, use npm install.
```
npm install
```

To start the server (with Nodemon), use npm start.
```
npm run start:dev
```
Connect to a postgresql database by using the following command to create a .env file from the sample provided.
```js
cp .env.sample .env
```
Then fill in your .env file with your postgresql database URL(s)
```js
// back-end .env example -> Connects to database
DATABASE_URL=enter-your-production-database-url-here
DATABASE_URL_DEVELOPMENT=enter-your-development-database-url-here
DATABASE_URL_TEST=enter-your-test-database-url-here
DATABASE_URL_PREVIEW=enter-your-preview-database-url-here
LOG_LEVEL=info
```
    
 Make sure to grab the frontend from   
     [Restaurant Reservation System Frontend](https://github.com/chriscarter79/finalcapstone_frontend "Restaurant Reservation System Frontend")