export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  genre: string[];
  rating: number;
  publishedDate: string;
  isFeatured?: boolean;
}

export const BOOKS: Book[] = [
  {
    id: "1",
    title: "The Night Circus",
    author: "Erin Morgenstern",
    description: "The circus arrives without warning. No announcements precede it. It is simply there, when yesterday it was not. Within the black-and-white striped canvas tents is an utterly unique experience full of breathtaking amazements. It is called Le Cirque des Rêves, and it is only open at night.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
    genre: ["Fantasy", "Romance", "Magical Realism"],
    rating: 4.8,
    publishedDate: "2011",
    isFeatured: true
  },
  {
    id: "2",
    title: "Circe",
    author: "Madeline Miller",
    description: "In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born. But Circe is a strange child — not powerful, like her father, nor viciously alluring like her mother. Turning to the world of mortals for companionship, she discovers that she does possess power — the power of witchcraft, which can transform rivals into monsters and tame the gods themselves.",
    coverImage: "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=800&auto=format&fit=crop",
    genre: ["Mythology", "Fantasy", "Fiction"],
    rating: 4.9,
    publishedDate: "2018",
    isFeatured: true
  },
  {
    id: "3",
    title: "Uprooted",
    author: "Naomi Novik",
    description: "Agnieszka loves her valley home, her quiet village, the scattered forests and the bright shining river. But the corrupted Wood stands on the border, full of malevolent power, and its shadow lies over her life.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-73c772ff397a?q=80&w=800&auto=format&fit=crop",
    genre: ["Fantasy", "Magic", "Young Adult"],
    rating: 4.7,
    publishedDate: "2015",
    isFeatured: true
  },
  {
    id: "4",
    title: "The Bear and the Nightingale",
    author: "Katherine Arden",
    description: "At the edge of the Russian wilderness, winter lasts most of the year and the snowdrifts grow taller than houses. But Vasilisa doesn't mind; she spends the winter nights huddled around the embers of a fire with her beloved siblings, listening to her nurse's fairy tales.",
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop",
    genre: ["Historical Fantasy", "Folklore", "Magic"],
    rating: 4.6,
    publishedDate: "2017"
  },
  {
    id: "5",
    title: "Stardust",
    author: "Neil Gaiman",
    description: "In the quiet English village of Wall, Tristran Thorn makes a promise to his beloved: he will retrieve a fallen star from the magical land beyond the wall. What follows is an epic adventure into the heart of Faerie.",
    coverImage: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?q=80&w=800&auto=format&fit=crop",
    genre: ["Fantasy", "Adventure", "Romance"],
    rating: 4.8,
    publishedDate: "1999"
  },
  {
    id: "6",
    title: "Spinning Silver",
    author: "Naomi Novik",
    description: "Miryem is the daughter and granddaughter of moneylenders, but her father's inability to collect his debts has left his family on the edge of poverty — until Miryem takes matters into her own hands.",
    coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop",
    genre: ["Fantasy", "Folklore", "Retellings"],
    rating: 4.9,
    publishedDate: "2018"
  }
];
