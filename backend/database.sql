CREATE TABLE userss (
    u_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    u_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
select * from userss

	insert into userss (u_name,email,password)
values 
('Najam ', 'najam@gmail.com','najam123');
DELETE FROM userss
WHERE email = 'najam@gmail.com';