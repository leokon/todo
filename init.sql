DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS tagmap CASCADE;

CREATE TABLE users (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  last_login timestamp NULL
);

CREATE TABLE tasks (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users (id),
  content text NOT NULL,
  position integer NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE tags (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users (id),
  name text NOT NULL,
  unique(user_id, name)
);

CREATE TABLE tagmap (
  id serial PRIMARY KEY,
  task_id integer REFERENCES tasks (id) ON DELETE CASCADE,
  tag_id integer REFERENCES tags (id) ON DELETE CASCADE,
  unique(task_id, tag_id)
);