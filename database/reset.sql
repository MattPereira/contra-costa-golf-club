DROP DATABASE IF EXISTS ccgc;
CREATE DATABASE ccgc;
\connect ccgc;

\i ccgc-schema.pgsql


DROP DATABASE IF EXISTS ccgc_test;
CREATE DATABASE ccgc_test;
\connect ccgc_test

\i ccgc-schema.pgsql