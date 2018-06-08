/************
    "likes" table   *************/

-- Table: public.likes

-- DROP TABLE public.likes;

CREATE TABLE public.likes
(
    likeid uuid NOT NULL DEFAULT gen_random_uuid(),
    userliking text COLLATE pg_catalog."default" NOT NULL,
    likedpin text COLLATE pg_catalog."default" NOT NULL,
    active boolean,
    likeddate timestamp with time zone,
    CONSTRAINT like_pkey PRIMARY KEY (likeid),
    CONSTRAINT user_pin_link UNIQUE (userliking, likedpin),
    CONSTRAINT users_pincid FOREIGN KEY (userliking)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT volumeid FOREIGN KEY (likedpin)
        REFERENCES public.pins (volume) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.likes
    OWNER to /*[YOUR OWNER USERNAME]*/;

COMMENT ON CONSTRAINT user_pin_link ON public.likes
    IS 'one user per pin id';

COMMENT ON CONSTRAINT users_pincid ON public.likes
    IS 'pincid not "id"';
COMMENT ON CONSTRAINT volumeid ON public.likes
    IS 'pin''s volume id';

/************
    "ownership" table *************/

-- Table: public.ownership

-- DROP TABLE public.ownership;

CREATE TABLE public.ownership
(
    owner text COLLATE pg_catalog."default" NOT NULL,
    pinid text COLLATE pg_catalog."default" NOT NULL,
    date_added text COLLATE pg_catalog."default",
    date_removed text COLLATE pg_catalog."default",
    active boolean,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tradeable boolean NOT NULL DEFAULT true,
    CONSTRAINT ownership_pkey PRIMARY KEY (id),
    CONSTRAINT "one owner per pinid" UNIQUE (owner, pinid),
    CONSTRAINT "none" FOREIGN KEY (pinid)
        REFERENCES public.pins (volume) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT owner FOREIGN KEY (owner)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.ownership
    OWNER to /*[YOUR OWNER USERNAME]*/;

COMMENT ON COLUMN public.ownership.pinid
    IS '"volume" from pins table';

COMMENT ON CONSTRAINT "none" ON public.ownership
    IS 'volume is the pin''s uuid';
COMMENT ON CONSTRAINT owner ON public.ownership
    IS 'user''s id';

-- Trigger: initlike_trigger

-- DROP TRIGGER initlike_trigger ON public.ownership;

CREATE TRIGGER initlike_trigger
    AFTER INSERT
    ON public.ownership
    FOR EACH ROW
    EXECUTE PROCEDURE public.initlike();

    /************
    "pins" table *************/

 -- Table: public.pins

-- DROP TABLE public.pins;

CREATE TABLE public.pins
(
    title text COLLATE pg_catalog."default",
    href text COLLATE pg_catalog."default" NOT NULL,
    image_url text COLLATE pg_catalog."default",
    url text COLLATE pg_catalog."default",
    active boolean DEFAULT true,
    tsv tsvector,
    origindate text COLLATE pg_catalog."default" DEFAULT 'unknown'::text,
    volume text COLLATE pg_catalog."default" NOT NULL DEFAULT (gen_random_uuid())::text,
    tags text[] COLLATE pg_catalog."default" NOT NULL DEFAULT '{None}'::text[],
    lastchecked timestamp with time zone,
    size text COLLATE pg_catalog."default",
    fformat text COLLATE pg_catalog."default",
    CONSTRAINT vol_pkey PRIMARY KEY (volume),
    CONSTRAINT pins_href_key UNIQUE (href)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.pins
    OWNER to /*[YOUR OWNER USERNAME]*/;

COMMENT ON COLUMN public.pins.origindate
    IS 'date first added to DB';

COMMENT ON COLUMN public.pins.tags
    IS 'may be redundant with ownership';

COMMENT ON COLUMN public.pins.size
    IS 'bytes when added';

COMMENT ON COLUMN public.pins.fformat
    IS 'type of image format';

-- Trigger: tsvectorupdate 

-- DROP TRIGGER "tsvectorupdate " ON public.pins;

CREATE TRIGGER "tsvectorupdate "
    BEFORE INSERT OR UPDATE 
    ON public.pins
    FOR EACH ROW
    EXECUTE PROCEDURE public.tsv_trigger();
    

/************
"session" table *************/

-- Table: public.session
-- DROP TABLE public.session;

CREATE TABLE public.session
(
    sid character varying COLLATE pg_catalog."default" NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL,
    CONSTRAINT session_pkey PRIMARY KEY (sid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.session
    OWNER to /*[YOUR OWNER USERNAME]*/  ;


/************
"users" table *************/

-- Table: public.users
-- DROP TABLE public.users;

CREATE TABLE public.users
(
    id text COLLATE pg_catalog."default" NOT NULL,
    "displayName" text COLLATE pg_catalog."default",
    gender text COLLATE pg_catalog."default",
    locations text[] COLLATE pg_catalog."default",
    ownership text[] COLLATE pg_catalog."default",
    city text COLLATE pg_catalog."default",
    state text COLLATE pg_catalog."default",
    pinc_id uuid NOT NULL DEFAULT gen_random_uuid(),
    image_url text COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.users
    OWNER to /*[YOUR OWNER USERNAME]*/  ;

COMMENT ON COLUMN public.users.image_url
    IS 'profile image';


/*Trigger Functions*/

--initlike
BEGIN
 INSERT INTO public.likes("userliking","likedpin","likeddate","active")
 VALUES(NEW.owner, NEW.pinid, NEW.date_added::timestamptz, true); 
 RETURN NEW;
END;

--tsv_trigger
BEGIN
	new.tsv :=
		to_tsvector('pg_catalog.english', coalesce(new.title,'')) ||
        to_tsvector('pg_catalog.english', coalesce(new.volume,'')) ||
		to_tsvector('pg_catalog.english', coalesce(array_to_string(new.tags,' '),''));
	return new;
END

