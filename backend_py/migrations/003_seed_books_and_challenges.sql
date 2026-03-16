insert into public.books (id, title, author, description, cover_image, genre, rating, published_date, is_featured)
values
  ('1', 'The Night Circus', 'Erin Morgenstern', 'A magical circus appears without warning and transforms lives.', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop', '["Fantasy","Romance","Magical Realism"]'::jsonb, 4.8, '2011', true),
  ('2', 'Circe', 'Madeline Miller', 'A mythic retelling about power, exile, and witchcraft.', 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=800&auto=format&fit=crop', '["Mythology","Fantasy","Fiction"]'::jsonb, 4.9, '2018', true),
  ('3', 'Uprooted', 'Naomi Novik', 'A village girl faces an ancient corrupted forest.', 'https://images.unsplash.com/photo-1512820790803-73c772ff397a?q=80&w=800&auto=format&fit=crop', '["Fantasy","Magic","Young Adult"]'::jsonb, 4.7, '2015', true),
  ('4', 'The Bear and the Nightingale', 'Katherine Arden', 'A folkloric winter tale on the Russian frontier.', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop', '["Historical Fantasy","Folklore","Magic"]'::jsonb, 4.6, '2017', false),
  ('5', 'Stardust', 'Neil Gaiman', 'A promise leads to a journey beyond the wall into Faerie.', 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?q=80&w=800&auto=format&fit=crop', '["Fantasy","Adventure","Romance"]'::jsonb, 4.8, '1999', false),
  ('6', 'Spinning Silver', 'Naomi Novik', 'A moneylender''s daughter turns survival into power.', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop', '["Fantasy","Folklore","Retellings"]'::jsonb, 4.9, '2018', false)
on conflict (id) do update
set
  title = excluded.title,
  author = excluded.author,
  description = excluded.description,
  cover_image = excluded.cover_image,
  genre = excluded.genre,
  rating = excluded.rating,
  published_date = excluded.published_date,
  is_featured = excluded.is_featured;

insert into public.challenge_templates (id, title, description, reward)
values
  ('midnight-reader', 'The Midnight Reader', 'Complete an intense thriller between 10 PM and 4 AM.', 'Lunar Reader Badge'),
  ('vibe-explorer', 'Vibe Explorer', 'Finish books in 3 different mood categories this month.', 'Mood Master Title'),
  ('social-sanctuary', 'Social Sanctuary', 'Discuss a vibe-matched book with a friend in a Circle.', 'Social Scroll Badge'),
  ('deep-diver', 'The Deep Diver', 'Complete a book with an emotional depth score over 80%.', 'Deep Sea Reader Badge')
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  reward = excluded.reward;
