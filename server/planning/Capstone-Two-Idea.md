# Contra Costa Golf Club App

## The problem
- The Contra Costa Golf Club needs a way to allow members to input their own golf scores (or the golf scores of other members), display a leaderboard, keep a record of past club golf round results, and determine winners.

## The Solution
- A full stack-web application fullfilling these requirements:
  1. Allow users to input golf round scores (strokes and putts) and save them to database
  2. Allow users to input greenies (distance to pin after the first stroke on par 3 holes) and save them to database
  3. Calculate winners of each round by factoring in handicaps
  4. Calculate skins winners for each round by factoring in the slope rating for each hole
  5. Store golf round scores, greenies, handicaps, and tournament points in a database
  6. Store golf course data (par and slope rating for each hole)
  7. Display a stroke leaderboard and a putts leaderboard for each round
  8. Display skins winners and greenies winners for each round

## Tools and Technologies
- Express for the backend to build an API that saves data to database and serves information from the database
  - PostgreSQL for the database
- React for the frontend 