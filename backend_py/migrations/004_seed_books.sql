-- Seed the 6 books from the Express backend (books.ts).
-- Column names match the Supabase / FastAPI schema in 001_initial_schema.sql.
-- Uses ON CONFLICT to make the script safely re-runnable.

insert into public.books (id, title, author, description, cover_image, genre, rating, published_date, is_featured)
values
(
    '1',
    'The Night Circus',
    'Erin Morgenstern',
    'The circus arrives without warning. No announcements precede it. It is simply there, when yesterday it was not. Within the black-and-white striped canvas tents is an utterly unique experience full of breathtaking amazements. It is called Le Cirque des Reves, and it is only open at night.',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
    '["Fantasy", "Romance", "Magical Realism"]'::jsonb,
    4.8,
    '2011',
    true
),
(
    '2',
    'Circe',
    'Madeline Miller',
    'In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born. But Circe is a strange child - not powerful, like her father, nor viciously alluring like her mother. Turning to the world of mortals for companionship, she discovers that she does possess power - the power of witchcraft, which can transform rivals into monsters and tame the gods themselves.',
    'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=800&auto=format&fit=crop',
    '["Mythology", "Fantasy", "Fiction"]'::jsonb,
    4.9,
    '2018',
    true
),
(
    '3',
    'Uprooted',
    'Naomi Novik',
    'Agnieszka loves her valley home, her quiet village, the scattered forests and the bright shining river. But the corrupted Wood stands on the border, full of malevolent power, and its shadow lies over her life.',
    'https://images.unsplash.com/photo-1512820790803-73c772ff397a?q=80&w=800&auto=format&fit=crop',
    '["Fantasy", "Magic", "Young Adult"]'::jsonb,
    4.7,
    '2015',
    true
),
(
    '4',
    'The Bear and the Nightingale',
    'Katherine Arden',
    E'At the edge of the Russian wilderness, winter lasts most of the year and the snowdrifts grow taller than houses. But Vasilisa doesn''t mind; she spends the winter nights huddled around the embers of a fire with her beloved siblings, listening to her nurse''s fairy tales.',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
    '["Historical Fantasy", "Folklore", "Magic"]'::jsonb,
    4.6,
    '2017',
    false
),
(
    '5',
    'Stardust',
    'Neil Gaiman',
    'In the quiet English village of Wall, Tristran Thorn makes a promise to his beloved: he will retrieve a fallen star from the magical land beyond the wall. What follows is an epic adventure into the heart of Faerie.',
    'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?q=80&w=800&auto=format&fit=crop',
    '["Fantasy", "Adventure", "Romance"]'::jsonb,
    4.8,
    '1999',
    false
),
(
    '6',
    'Spinning Silver',
    'Naomi Novik',
    E'Miryem is the daughter and granddaughter of moneylenders, but her father''s inability to collect his debts has left his family on the edge of poverty - until Miryem takes matters into her own hands.',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop',
    '["Fantasy", "Folklore", "Retellings"]'::jsonb,
    4.9,
    '2018',
    false
)
on conflict (id) do update set
    title          = excluded.title,
    author         = excluded.author,
    description    = excluded.description,
    cover_image    = excluded.cover_image,
    genre          = excluded.genre,
    rating         = excluded.rating,
    published_date = excluded.published_date,
    is_featured    = excluded.is_featured;
