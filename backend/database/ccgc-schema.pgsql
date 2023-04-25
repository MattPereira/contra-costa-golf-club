CREATE TABLE users (
    username VARCHAR(30) PRIMARY KEY,
    email TEXT NOT NULL CHECK (position('@' IN email) > 1),
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

create TABLE courses (
    handle TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rating DECIMAL NOT NULL,
    slope INTEGER NOT NULL,
    img_url TEXT
);

create TABLE pars (
    course_handle TEXT NOT NULL REFERENCES courses(handle) ON DELETE CASCADE,
    hole1 INTEGER NOT NULL,
    hole2 INTEGER NOT NULL,
    hole3 INTEGER NOT NULL,
    hole4 INTEGER NOT NULL,
    hole5 INTEGER NOT NULL,
    hole6 INTEGER NOT NULL,
    hole7 INTEGER NOT NULL,
    hole8 INTEGER NOT NULL,
    hole9 INTEGER NOT NULL,
    hole10 INTEGER NOT NULL,
    hole11 INTEGER NOT NULL,
    hole12 INTEGER NOT NULL,
    hole13 INTEGER NOT NULL,
    hole14 INTEGER NOT NULL,
    hole15 INTEGER NOT NULL,
    hole16 INTEGER NOT NULL,
    hole17 INTEGER NOT NULL,
    hole18 INTEGER NOT NULL,
    total INTEGER NOT NULL
);

create TABLE handicaps (
    course_handle TEXT NOT NULL REFERENCES courses(handle) ON DELETE CASCADE,
    hole1 INTEGER NOT NULL,
    hole2 INTEGER NOT NULL,
    hole3 INTEGER NOT NULL,
    hole4 INTEGER NOT NULL,
    hole5 INTEGER NOT NULL,
    hole6 INTEGER NOT NULL,
    hole7 INTEGER NOT NULL,
    hole8 INTEGER NOT NULL,
    hole9 INTEGER NOT NULL,
    hole10 INTEGER NOT NULL,
    hole11 INTEGER NOT NULL,
    hole12 INTEGER NOT NULL,
    hole13 INTEGER NOT NULL,
    hole14 INTEGER NOT NULL,
    hole15 INTEGER NOT NULL,
    hole16 INTEGER NOT NULL,
    hole17 INTEGER NOT NULL,
    hole18 INTEGER NOT NULL
);


create TABLE tournaments (
    date DATE PRIMARY KEY,
    course_handle TEXT REFERENCES courses(handle),
    tour_years VARCHAR(7) NOT NULL
);

create TABLE rounds (
    id SERIAL PRIMARY KEY,
    tournament_date DATE NOT NULL REFERENCES tournaments(date),
    username VARCHAR(30) NOT NULL 
      REFERENCES users(username),
    -----  ALL CALCULATIONS BELOW THIS LINE -----
    total_strokes INTEGER NOT NULL,
    net_strokes INTEGER NOT NULL,
    total_putts INTEGER NOT NULL,
    player_index DECIMAL NOT NULL,
    score_differential DECIMAL NOT NULL,
    course_handicap INTEGER NOT NULL
);

create TABLE points (
    round_id INTEGER PRIMARY KEY REFERENCES rounds(id) ON DELETE CASCADE,
    strokes INTEGER NOT NULL DEFAULT 0,
    putts INTEGER NOT NULL DEFAULT 0,
    greenies INTEGER NOT NULL DEFAULT 0,
    pars INTEGER NOT NULL DEFAULT 0,
    birdies INTEGER NOT NULL DEFAULT 0,
    eagles INTEGER NOT NULL DEFAULT 0,
    aces INTEGER NOT NULL DEFAULT 0,
    participation INTEGER NOT NULL DEFAULT 3
);


create TABLE greenies (
    id SERIAL PRIMARY KEY,
    round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    hole_number INTEGER NOT NULL,
    feet INTEGER NOT NULL,
    inches INTEGER NOT NULL
);


create TABLE strokes (
    round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    hole1 INTEGER NOT NULL,
    hole2 INTEGER NOT NULL,
    hole3 INTEGER NOT NULL,
    hole4 INTEGER NOT NULL,
    hole5 INTEGER NOT NULL,
    hole6 INTEGER NOT NULL,
    hole7 INTEGER NOT NULL,
    hole8 INTEGER NOT NULL,
    hole9 INTEGER NOT NULL,
    hole10 INTEGER NOT NULL,
    hole11 INTEGER NOT NULL,
    hole12 INTEGER NOT NULL,
    hole13 INTEGER NOT NULL,
    hole14 INTEGER NOT NULL,
    hole15 INTEGER NOT NULL,
    hole16 INTEGER NOT NULL,
    hole17 INTEGER NOT NULL,
    hole18 INTEGER NOT NULL
);

create TABLE putts (
    round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    hole1 INTEGER NOT NULL,
    hole2 INTEGER NOT NULL,
    hole3 INTEGER NOT NULL,
    hole4 INTEGER NOT NULL,
    hole5 INTEGER NOT NULL,
    hole6 INTEGER NOT NULL,
    hole7 INTEGER NOT NULL,
    hole8 INTEGER NOT NULL,
    hole9 INTEGER NOT NULL,
    hole10 INTEGER NOT NULL,
    hole11 INTEGER NOT NULL,
    hole12 INTEGER NOT NULL,
    hole13 INTEGER NOT NULL,
    hole14 INTEGER NOT NULL,
    hole15 INTEGER NOT NULL,
    hole16 INTEGER NOT NULL,
    hole17 INTEGER NOT NULL,
    hole18 INTEGER NOT NULL
);