import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 0) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function ensureEnvLoaded() {
  const root = process.cwd();
  loadEnvFile(path.join(root, ".env.local"));
  loadEnvFile(path.join(root, ".env"));
}

ensureEnvLoaded();

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is required for seeding.");
  process.exit(1);
}

const runReset = process.argv.includes("--reset");
if (runReset && process.env.NODE_ENV === "production" && process.env.ALLOW_SEED_RESET !== "true") {
  console.error(
    "Refusing destructive reset in production. Set ALLOW_SEED_RESET=true if you intentionally want this.",
  );
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["student", "trainer", "admin"], default: "student" },
    avatar: String,
  },
  { timestamps: true },
);

const trainerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    bio: String,
    specialty: String,
    experience: Number,
    rating: Number,
    approved: { type: Boolean, default: false },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true },
);

const courseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    thumbnail: String,
    price: Number,
    level: String,
    category: String,
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer" },
    rating: Number,
    students: Number,
  },
  { timestamps: true },
);

const lessonSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    title: String,
    videoUrl: String,
    duration: Number,
    order: Number,
  },
  { timestamps: true },
);
lessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

const enrollmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    progress: Number,
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  },
  { timestamps: true },
);
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    rating: Number,
    comment: String,
  },
  { timestamps: true },
);
reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const bookingSchema = new mongoose.Schema(
  {
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sessionDate: Date,
    price: Number,
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Trainer = mongoose.models.Trainer || mongoose.model("Trainer", trainerSchema);
const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);
const Enrollment = mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

async function upsertUser({ name, email, password, role, avatar }) {
  const update = { name, email, role, avatar };
  if (password) update.password = await bcrypt.hash(password, 10);
  return User.findOneAndUpdate({ email }, { $set: update }, { upsert: true, new: true });
}

async function upsertTrainerProfile(user, data) {
  return Trainer.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        userId: user._id,
        bio: data.bio,
        specialty: data.specialty,
        experience: data.experience,
        rating: data.rating,
        approved: data.approved,
      },
      $setOnInsert: { courses: [] },
    },
    { upsert: true, new: true },
  );
}

async function upsertCourse(trainer, data) {
  return Course.findOneAndUpdate(
    { title: data.title, trainerId: trainer._id },
    { $set: { ...data, trainerId: trainer._id } },
    { upsert: true, new: true },
  );
}

async function upsertLesson(course, lesson) {
  return Lesson.findOneAndUpdate(
    { courseId: course._id, order: lesson.order },
    { $set: { ...lesson, courseId: course._id } },
    { upsert: true, new: true },
  );
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "sanshou-platform" });
  console.log("Connected to MongoDB.");

  if (runReset) {
    console.log("Reset mode enabled. Clearing existing collections...");
    await Promise.all([
      Booking.deleteMany({}),
      Review.deleteMany({}),
      Enrollment.deleteMany({}),
      Lesson.deleteMany({}),
      Course.deleteMany({}),
      Trainer.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log("Collections cleared.");
  }

  const [admin, student, trainerAUser, trainerBUser, trainerPendingUser] = await Promise.all([
    upsertUser({
      name: "Admin Sensei",
      email: "admin@sanshou.dev",
      password: "Admin@12345",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    }),
    upsertUser({
      name: "Student Kai",
      email: "student@sanshou.dev",
      password: "Student@12345",
      role: "student",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
    }),
    upsertUser({
      name: "Master Arjun",
      email: "arjun@sanshou.dev",
      password: "Trainer@12345",
      role: "trainer",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    }),
    upsertUser({
      name: "Sensei Kaori",
      email: "kaori@sanshou.dev",
      password: "Trainer@12345",
      role: "trainer",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
    }),
    upsertUser({
      name: "Coach Pending",
      email: "pending@sanshou.dev",
      password: "Trainer@12345",
      role: "trainer",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80",
    }),
  ]);

  const [trainerA, trainerB, trainerPending] = await Promise.all([
    upsertTrainerProfile(trainerAUser, {
      bio: "Elite kickboxing trainer with international fight camp experience.",
      specialty: "Kickboxing",
      experience: 11,
      rating: 4.9,
      approved: true,
    }),
    upsertTrainerProfile(trainerBUser, {
      bio: "Mental conditioning expert focused on composure and tactical decision-making.",
      specialty: "Meditation",
      experience: 9,
      rating: 4.8,
      approved: true,
    }),
    upsertTrainerProfile(trainerPendingUser, {
      bio: "Strength and conditioning specialist for combat performance.",
      specialty: "Fitness",
      experience: 6,
      rating: 4.2,
      approved: false,
    }),
  ]);

  const courseA = await upsertCourse(trainerA, {
    title: "Kickboxing Fundamentals",
    description: "Build stance, footwork, combinations, and ring confidence through structured drills.",
    thumbnail: "https://images.unsplash.com/photo-1549570652-97324981a6fd?auto=format&fit=crop&w=1200&q=80",
    price: 89,
    level: "Beginner",
    category: "Kickboxing",
    rating: 4.9,
    students: 240,
  });

  const courseB = await upsertCourse(trainerB, {
    title: "Mental Combat Conditioning",
    description: "Train focus, emotional discipline, and pressure handling for competition and daily life.",
    thumbnail: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1200&q=80",
    price: 69,
    level: "Intermediate",
    category: "Meditation",
    rating: 4.8,
    students: 190,
  });

  await Promise.all([
    Trainer.findByIdAndUpdate(trainerA._id, { courses: [courseA._id] }),
    Trainer.findByIdAndUpdate(trainerB._id, { courses: [courseB._id] }),
    Trainer.findByIdAndUpdate(trainerPending._id, { courses: [] }),
  ]);

  const [a1, a2, a3, b1, b2, b3] = await Promise.all([
    upsertLesson(courseA, {
      title: "Stance and Guard",
      videoUrl: "https://res.cloudinary.com/demo/video/upload/v1690000000/samples/elephants.mp4",
      duration: 8,
      order: 1,
    }),
    upsertLesson(courseA, {
      title: "Footwork and Distance",
      videoUrl: "https://res.cloudinary.com/demo/video/upload/v1690000000/samples/sea-turtle.mp4",
      duration: 10,
      order: 2,
    }),
    upsertLesson(courseA, {
      title: "Basic Combinations",
      videoUrl: "https://res.cloudinary.com/demo/video/upload/v1690000000/samples/elephants.mp4",
      duration: 12,
      order: 3,
    }),
    upsertLesson(courseB, {
      title: "Meditation Basics",
      videoUrl: "https://res.cloudinary.com/demo/video/upload/v1690000000/samples/sea-turtle.mp4",
      duration: 7,
      order: 1,
    }),
    upsertLesson(courseB, {
      title: "Breath Control Under Pressure",
      videoUrl: "https://res.cloudinary.com/demo/video/upload/v1690000000/samples/elephants.mp4",
      duration: 9,
      order: 2,
    }),
    upsertLesson(courseB, {
      title: "Tactical Focus Drills",
      videoUrl: "https://res.cloudinary.com/demo/video/upload/v1690000000/samples/sea-turtle.mp4",
      duration: 11,
      order: 3,
    }),
  ]);

  await Enrollment.findOneAndUpdate(
    { userId: student._id, courseId: courseA._id },
    {
      $set: {
        progress: 67,
        completedLessons: [a1._id, a2._id],
      },
    },
    { upsert: true, new: true },
  );

  await Enrollment.findOneAndUpdate(
    { userId: student._id, courseId: courseB._id },
    {
      $set: {
        progress: 33,
        completedLessons: [b1._id],
      },
    },
    { upsert: true, new: true },
  );

  await Review.findOneAndUpdate(
    { userId: student._id, courseId: courseA._id },
    {
      $set: {
        rating: 5,
        comment: "Best entry path into striking. The progression feels smooth and practical.",
      },
    },
    { upsert: true, new: true },
  );

  await Booking.findOneAndUpdate(
    { userId: student._id, trainerId: trainerA._id, sessionDate: new Date("2026-03-20T17:00:00.000Z") },
    {
      $set: {
        price: 60,
        status: "confirmed",
      },
    },
    { upsert: true, new: true },
  );

  console.log("");
  console.log(`Seed completed${runReset ? " (with reset)" : ""}.`);
  console.log("Demo accounts:");
  console.log("- admin@sanshou.dev / Admin@12345");
  console.log("- student@sanshou.dev / Student@12345");
  console.log("- arjun@sanshou.dev / Trainer@12345");
  console.log("- kaori@sanshou.dev / Trainer@12345");
  console.log("- pending@sanshou.dev / Trainer@12345");
  console.log("");
  console.log("Created courses:");
  console.log("- Kickboxing Fundamentals");
  console.log("- Mental Combat Conditioning");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
