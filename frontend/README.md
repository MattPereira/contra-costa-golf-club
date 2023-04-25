
# [Contra Costa Golf Club](https://ccgc.vercel.app/)

|     Logo        |     Live Site        |   Repositories    |
| ----------- | ----------- | --------        |
| [<img src="https://i.ibb.co/72nKCSf/ccgc-Logo11.png" width="200" height="250"/>](https://ccgc.vercel.app/)  | <p> [https://ccgc.vercel.app/](https://ccgc.vercel.app/)</p>    |       <p>[Frontend](https://github.com/MattPereira/ccgc-frontend)</p><p>[Backend](https://github.com/MattPereira/ccgc-backend)</p>         |




## Description
A full-stack web application that manages all of the [tournaments](https://ccgc.vercel.app/tournaments), [greenies](https://ccgc.vercel.app/greenies), [members](https://ccgc.vercel.app/members), [courses](https://ccgc.vercel.app/courses), and [standings](https://ccgc.vercel.app/standings) data for the contra costa golf club. Tournament data tables are sorted in ascending order to display the winners of each round. Additionally, all users are able to input their strokes, putts, and greenies for each round. Upon submission of any new, edited, or deleted data, tour points are automatically recalculated. 


## Features
**Full CRUD**
  * Regular users can create, update, and delete their round data (strokes, putts and greenies) 
  * Admin users can additionally manage golf course, tournament, and member data

**Custom Internal API**
  * deployed on Railway at [https://ccgc.up.railway.app/](https://ccgc.up.railway.app/)
  * JSON Schema validation
  
**User authentication and authorization**
  * Using JSON Web Tokens 
  * Created on the back-end upon user registration or login
  * Stored on the front-end using React state and localStorage

**Tour Points System**
  * Points are updated on each round creation, update, or deletion
  * Points are aggregated and displayed for each golfer by tournament and by season
  * Point Generating Events
    * The lowest 5 net strokes finishers for each tournament
    * The lowest 3 total putts finishers for each tournament
    * Each greenie generates 1 to 4 points depending on distance from pin
    * Each par, birdie, eagle, and ace generates points
    * Each round played generates 3 points

**Handicap System**
  * Total Strokes: raw sum of strokes for all 18 holes
  * Score Differential: (113 / Slope) * (Total Strokes - Rating)
  * Handicap Index: average of lowest two rounds out of the last four
  * Course Handicap: (Handicap Index * Slope) / 113
  * Net Strokes: Total Strokes - Course Handicap

## Database Schema

![image](https://user-images.githubusercontent.com/73561520/220162284-03d9c105-65e5-45f8-9487-929dcce4b8f1.png)



## Tech Stack
* React
* React Router
* Express
* PostgreSQL
* Material UI
* JavaScript
* HTML
* CSS


## Testing
* 180 Backend tests covering all the API endpoints
* Run using "npm test"
