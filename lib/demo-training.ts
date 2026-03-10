/**
 * Shared demo courses and experts for Training hub and Dashboard when API has no data.
 */

export const DEMO_COURSES = [
  { _id: "c1", title: "Kickboxing Fundamentals", trainer: "Coach Daniel Reyes", duration: "6 Weeks", category: "Kickboxing", level: "Beginner", rating: 4.7, price: 89, thumbnail: "https://images.unsplash.com/photo-1549570652-97324981a6fd?w=400&q=80", students: 240 },
  { _id: "c2", title: "MMA Combat Basics", trainer: "Alex Volkov", duration: "8 Weeks", category: "MMA", level: "Beginner", rating: 4.6, price: 99, thumbnail: "https://images.unsplash.com/photo-1583468982228-19f19164aee6?w=400&q=80", students: 180 },
  { _id: "c3", title: "Karate Discipline Program", trainer: "Sensei Hiro Tanaka", duration: "10 Weeks", category: "Karate", level: "All levels", rating: 4.8, price: 79, thumbnail: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=400&q=80", students: 120 },
  { _id: "c4", title: "Muay Thai Striking System", trainer: "Kru Chai Sak", duration: "7 Weeks", category: "Muay Thai", level: "Intermediate", rating: 4.9, price: 109, thumbnail: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80", students: 200 },
  { _id: "c5", title: "Street Self Defence Mastery", trainer: "Coach Marco Silva", duration: "5 Weeks", category: "Self Defence", level: "Beginner", rating: 4.6, price: 69, thumbnail: "https://images.unsplash.com/photo-1616279969856-759f316a5ac1?w=400&q=80", students: 310 },
  { _id: "c6", title: "Brazilian Jiu-Jitsu Foundations", trainer: "Rafael Costa", duration: "9 Weeks", category: "BJJ", level: "Beginner", rating: 4.8, price: 119, thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80", students: 95 },
  { _id: "c7", title: "Fighter Strength Conditioning", trainer: "Coach Tyler Grant", duration: "6 Weeks", category: "Fitness", level: "All levels", rating: 4.7, price: 59, thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80", students: 280 },
  { _id: "c8", title: "Meditation for Fighters", trainer: "Dr. Aisha Rahman", duration: "4 Weeks", category: "Mental Strength", level: "All levels", rating: 4.8, price: 49, thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80", students: 150 },
  { _id: "c9", title: "Combat Agility Training", trainer: "Coach Ivan Petrov", duration: "5 Weeks", category: "Fitness", level: "Intermediate", rating: 4.7, price: 79, thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", students: 110 },
  { _id: "c10", title: "Advanced Kickboxing Combinations", trainer: "Coach Daniel Reyes", duration: "8 Weeks", category: "Kickboxing", level: "Advanced", rating: 4.9, price: 129, thumbnail: "https://images.unsplash.com/photo-1549570652-97324981a6fd?w=400&q=80", students: 85 },
] as const;

export const DEMO_EXPERTS = [
  { _id: "t1", name: "Master Chen Wei", photo: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&q=80", specialty: "Sanshou & Kickboxing", rating: 4.9, courses: 6, yearsExperience: 20 },
  { _id: "t2", name: "Sensei Hiro Tanaka", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", specialty: "Karate Master", rating: 4.8, courses: 5, yearsExperience: 25 },
  { _id: "t3", name: "Coach Daniel Reyes", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", specialty: "Kickboxing Champion", rating: 4.7, courses: 4, yearsExperience: 15 },
  { _id: "t4", name: "Kru Chai Sak", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", specialty: "Muay Thai Trainer", rating: 4.9, courses: 3, yearsExperience: 18 },
  { _id: "t5", name: "Alex Volkov", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80", specialty: "MMA Fighter", rating: 4.6, courses: 4, yearsExperience: 12 },
  { _id: "t6", name: "Rafael Costa", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80", specialty: "BJJ Black Belt", rating: 4.8, courses: 3, yearsExperience: 14 },
  { _id: "t7", name: "Coach Tyler Grant", photo: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200&q=80", specialty: "Combat Strength Coach", rating: 4.7, courses: 5, yearsExperience: 10 },
  { _id: "t8", name: "Dr. Aisha Rahman", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", specialty: "Mental Performance Coach", rating: 4.8, courses: 2, yearsExperience: 12 },
  { _id: "t9", name: "Coach Marco Silva", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80", specialty: "Self Defence Expert", rating: 4.6, courses: 4, yearsExperience: 16 },
  { _id: "t10", name: "Coach Ivan Petrov", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", specialty: "Combat Conditioning Trainer", rating: 4.7, courses: 3, yearsExperience: 11 },
] as const;

function popularityScore(c: (typeof DEMO_COURSES)[number]) {
  return (c.students ?? 0) + (c.rating ?? 0) * 5;
}

function expertScore(t: (typeof DEMO_EXPERTS)[number]) {
  return (t.rating ?? 0) + (t.courses ?? 0) * 0.5;
}

/** Featured courses for dashboard (by popularity, max 8). */
export function getFeaturedDemoCourses(limit = 8) {
  return [...DEMO_COURSES]
    .sort((a, b) => popularityScore(b) - popularityScore(a))
    .slice(0, limit)
    .map((c) => ({
      _id: c._id,
      title: c.title,
      thumbnail: c.thumbnail,
      trainer: c.trainer,
      rating: c.rating,
      price: c.price,
      duration: c.duration,
      level: c.level,
    }));
}

/** Top experts for dashboard (by rating + courses, max 8). */
export function getFeaturedDemoExperts(limit = 8) {
  return [...DEMO_EXPERTS]
    .sort((a, b) => expertScore(b) - expertScore(a))
    .slice(0, limit)
    .map((t) => ({
      _id: t._id,
      name: t.name,
      photo: t.photo,
      specialty: t.specialty,
      rating: t.rating,
      courses: t.courses,
      yearsExperience: t.yearsExperience,
    }));
}
