--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: simple_posts; Type: TABLE; Schema: public; Owner: student
--

CREATE TABLE public.simple_posts (
    id integer NOT NULL,
    user_id integer,
    title character varying(200) NOT NULL,
    content text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.simple_posts OWNER TO student;

--
-- Name: simple_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: student
--

CREATE SEQUENCE public.simple_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.simple_posts_id_seq OWNER TO student;

--
-- Name: simple_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: student
--

ALTER SEQUENCE public.simple_posts_id_seq OWNED BY public.simple_posts.id;


--
-- Name: simple_users; Type: TABLE; Schema: public; Owner: student
--

CREATE TABLE public.simple_users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.simple_users OWNER TO student;

--
-- Name: simple_users_id_seq; Type: SEQUENCE; Schema: public; Owner: student
--

CREATE SEQUENCE public.simple_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.simple_users_id_seq OWNER TO student;

--
-- Name: simple_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: student
--

ALTER SEQUENCE public.simple_users_id_seq OWNED BY public.simple_users.id;


--
-- Name: simple_posts id; Type: DEFAULT; Schema: public; Owner: student
--

ALTER TABLE ONLY public.simple_posts ALTER COLUMN id SET DEFAULT nextval('public.simple_posts_id_seq'::regclass);


--
-- Name: simple_users id; Type: DEFAULT; Schema: public; Owner: student
--

ALTER TABLE ONLY public.simple_users ALTER COLUMN id SET DEFAULT nextval('public.simple_users_id_seq'::regclass);


--
-- Data for Name: simple_posts; Type: TABLE DATA; Schema: public; Owner: student
--

COPY public.simple_posts (id, user_id, title, content, created_at) FROM stdin;
1	1	My First Post	Hello world! This is my first blog post.	2025-06-28 04:10:23.524443
2	1	Learning SQL	SQL is quite interesting once you get the hang of it.	2025-06-28 04:10:23.524443
3	2	Database Tips	Always backup your data regularly!	2025-06-28 04:10:23.524443
4	3	Weekend Plans	Going hiking this weekend. Should be fun!	2025-06-28 04:10:23.524443
5	4	Book Review	Just finished reading a great book about databases.	2025-06-28 04:10:23.524443
6	5	Recipe Share	Here is my favorite pasta recipe...	2025-06-28 04:10:23.524443
\.


--
-- Data for Name: simple_users; Type: TABLE DATA; Schema: public; Owner: student
--

COPY public.simple_users (id, name, email, created_at) FROM stdin;
1	Alice Johnson	alice@example.com	2025-06-28 04:10:23.524443
2	Bob Smith	bob@example.com	2025-06-28 04:10:23.524443
3	Carol Brown	carol@example.com	2025-06-28 04:10:23.524443
4	David Wilson	david@example.com	2025-06-28 04:10:23.524443
5	Emma Davis	emma@example.com	2025-06-28 04:10:23.524443
\.


--
-- Name: simple_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: student
--

SELECT pg_catalog.setval('public.simple_posts_id_seq', 6, true);


--
-- Name: simple_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: student
--

SELECT pg_catalog.setval('public.simple_users_id_seq', 5, true);


--
-- Name: simple_posts simple_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: student
--

ALTER TABLE ONLY public.simple_posts
    ADD CONSTRAINT simple_posts_pkey PRIMARY KEY (id);


--
-- Name: simple_users simple_users_email_key; Type: CONSTRAINT; Schema: public; Owner: student
--

ALTER TABLE ONLY public.simple_users
    ADD CONSTRAINT simple_users_email_key UNIQUE (email);


--
-- Name: simple_users simple_users_pkey; Type: CONSTRAINT; Schema: public; Owner: student
--

ALTER TABLE ONLY public.simple_users
    ADD CONSTRAINT simple_users_pkey PRIMARY KEY (id);


--
-- Name: simple_posts simple_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: student
--

ALTER TABLE ONLY public.simple_posts
    ADD CONSTRAINT simple_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.simple_users(id);


--
-- PostgreSQL database dump complete
--

