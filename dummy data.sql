insert into users(name, email, password)  values('홍길동', 'hong1@gmail.com', 'admin1234'); -- 1
insert into users(name, email, password)  values('이영록', 'rok@gmail.com', 'admin1234'); -- 2

insert into habits(habit_name, start_date, end_date, user_id) values ('Morning Exercise', '2024-10-01', '2024-10-30', 1);
insert into habits(habit_name, start_date, end_date, user_id) values ('Lunch Exercise', '2024-10-01', '2024-10-30', 1);
insert into habits(habit_name, start_date, end_date, user_id) values ('Dinner Exercise', '2024-10-01', '2024-10-30', 1);

-- Morning Exercise
insert into records(memo, habit_id) values('Day 1 Morning Exercise Complete', 1);
insert into records(memo, habit_id) values('Day 2 Morning Exercise Complete', 1);
insert into records(memo, habit_id) values('Day 3 Morning Exercise Complete', 1);
insert into records(memo, habit_id) values('Day 4 Morning Exercise Complete', 1);

-- Dinner Exercise
insert into records(memo, habit_id) values('Day 1 Dinner Exercise Complete', 3);
insert into records(memo, habit_id) values('Day 2 Dinner Exercise Complete', 3);
insert into records(memo, habit_id) values('Day 3 Dinner Exercise Complete', 3);

