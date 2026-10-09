/**
 * Motivational quotes for the Pomodoro reading break (books mode).
 * Curated from student-focused quote collections.
 */

export type MotivationalQuote = {
  text: string;
  author: string;
};

export const motivationalQuotes: MotivationalQuote[] = [
  {
    text: "Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence.",
    author: "Helen Keller",
  },
  {
    text: "The mind is not a vessel to be filled but a fire to be ignited.",
    author: "Plutarch",
  },
  {
    text: "Don't let what you cannot do interfere with what you can do.",
    author: "John Wooden",
  },
  {
    text: "A person who never made a mistake never tried anything new.",
    author: "Albert Einstein",
  },
  {
    text: "Excellence is not a skill. It is an attitude.",
    author: "Ralph Marston",
  },
  {
    text: "Quality is not an act, it is a habit.",
    author: "Aristotle",
  },
  {
    text: "I think it's possible for ordinary people to choose to be extraordinary.",
    author: "Elon Musk",
  },
  {
    text: "The best way to predict your future is to create it.",
    author: "Abraham Lincoln",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    text: "Doubt kills more dreams than failure ever will.",
    author: "Karim Seddiki",
  },
  {
    text: "You are braver than you believe, stronger than you seem and smarter than you think.",
    author: "A.A. Milne",
  },
  {
    text: "Go confidently in the direction of your dreams. Live the life you have imagined.",
    author: "Henry David Thoreau",
  },
  {
    text: "Learn from yesterday. Live for today. Hope for tomorrow.",
    author: "Albert Einstein",
  },
  {
    text: "The more that you read, the more things you will know, the more that you learn, the more places you'll go.",
    author: "Dr. Seuss",
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
  },
  {
    text: "Hardships often prepare ordinary people for an extraordinary destiny.",
    author: "C.S. Lewis",
  },
  {
    text: "There is no elevator to success. You have to take the stairs.",
    author: "Zig Ziglar",
  },
  {
    text: "Genius is 10% inspiration, 90% perspiration.",
    author: "Thomas Edison",
  },
  {
    text: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun",
  },
  {
    text: "Success is the sum of small efforts, repeated.",
    author: "R. Collier",
  },
  {
    text: "If opportunity doesn't knock, build a door.",
    author: "Milton Berle",
  },
  {
    text: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
  {
    text: "There are no traffic jams on the extra mile.",
    author: "Zig Ziglar",
  },
  {
    text: "Every accomplishment starts with the decision to try.",
    author: "Gail Devers",
  },
  {
    text: "Procrastination makes easy things hard and hard things harder.",
    author: "Mason Cooley",
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice, and most of all, love of what you are doing or learning to do.",
    author: "Pelé",
  },
  {
    text: "The man who moves a mountain begins by carrying away small stones.",
    author: "Confucius",
  },
  {
    text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
    author: "Malcolm X",
  },
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
  },
  {
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
  },
  {
    text: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe",
  },
  {
    text: "I've failed over and over and over again in my life. And that is why I succeed.",
    author: "Michael Jordan",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    text: "If you're going through hell, keep going.",
    author: "Winston Churchill",
  },
  {
    text: "Failure is the opportunity to begin again more intelligently.",
    author: "Henry Ford",
  },
  {
    text: "Believe deep down in your heart that you're destined to do great things.",
    author: "Joe Paterno",
  },
  {
    text: "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
    author: "Christian D. Larson",
  },
  {
    text: "Teachers can open the door, but you must enter it yourself.",
    author: "Chinese proverb",
  },
  {
    text: "Learning without thinking is useless. Thinking without learning is dangerous.",
    author: "Confucius",
  },
  {
    text: "Do the best you can until you know better. Then when you know better, do better.",
    author: "Maya Angelou",
  },
  {
    text: "I don't love studying. I hate studying. I like learning. Learning is beautiful.",
    author: "Natalie Portman",
  },
  {
    text: "The only place where success comes before work is in the dictionary.",
    author: "Vidal Sassoon",
  },
];

export function pickRandomQuote(): MotivationalQuote {
  const i = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[i]!;
}
