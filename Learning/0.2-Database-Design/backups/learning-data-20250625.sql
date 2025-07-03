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
-- Name: test_persistence; Type: TABLE; Schema: public; Owner: student
--

CREATE TABLE public.test_persistence (
    id integer NOT NULL,
    message text
);


ALTER TABLE public.test_persistence OWNER TO student;

--
-- Name: test_persistence_id_seq; Type: SEQUENCE; Schema: public; Owner: student
--

CREATE SEQUENCE public.test_persistence_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.test_persistence_id_seq OWNER TO student;

--
-- Name: test_persistence_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: student
--

ALTER SEQUENCE public.test_persistence_id_seq OWNED BY public.test_persistence.id;


--
-- Name: test_persistence id; Type: DEFAULT; Schema: public; Owner: student
--

ALTER TABLE ONLY public.test_persistence ALTER COLUMN id SET DEFAULT nextval('public.test_persistence_id_seq'::regclass);


--
-- Data for Name: test_persistence; Type: TABLE DATA; Schema: public; Owner: student
--

COPY public.test_persistence (id, message) FROM stdin;
1	This data should survive container restart!
\.


--
-- Name: test_persistence_id_seq; Type: SEQUENCE SET; Schema: public; Owner: student
--

SELECT pg_catalog.setval('public.test_persistence_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

