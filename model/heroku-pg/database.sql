-- public."user" definition

-- Drop table

-- DROP TABLE public."user";

CREATE TABLE public."user" (
	id serial NOT NULL,
	username text NULL,
	"password" text NULL,
	CONSTRAINT user_pkey PRIMARY KEY (id)
);


-- public.task definition

-- Drop table

-- DROP TABLE public.task;

CREATE TABLE public.task (
	id serial NOT NULL,
	task text NOT NULL,
	status int4 NOT NULL DEFAULT 0,
	created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP,
	user_id int4 NULL,
	CONSTRAINT task_pkey PRIMARY KEY (id),
	CONSTRAINT task_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);