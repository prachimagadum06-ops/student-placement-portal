import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../../lib/db/src/schema/index.js";
import {
  usersTable,
  studentsTable,
  companiesTable,
  jobsTable,
  applicationsTable,
  notificationsTable,
} from "../../lib/db/src/schema/index.js";
import { eq } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  console.log("Seeding database...");

  // Admin user
  const adminHash = await bcrypt.hash("admin123", 10);
  let adminUser;
  const [existingAdmin] = await db.select().from(usersTable).where(eq(usersTable.email, "admin@placement.edu"));
  if (existingAdmin) {
    adminUser = existingAdmin;
    console.log("Admin already exists");
  } else {
    [adminUser] = await db.insert(usersTable).values({ email: "admin@placement.edu", passwordHash: adminHash, role: "admin" }).returning();
    console.log("Admin created:", adminUser.email);
  }

  // Companies
  const companyData = [
    { name: "Infosys", industry: "IT Services", website: "https://infosys.com", description: "Global IT and consulting company", location: "Bengaluru" },
    { name: "TCS", industry: "IT Services", website: "https://tcs.com", description: "Tata Consultancy Services", location: "Mumbai" },
    { name: "Google", industry: "Technology", website: "https://google.com", description: "Search and cloud technology giant", location: "Hyderabad" },
    { name: "Amazon", industry: "E-Commerce & Cloud", website: "https://amazon.com", description: "Global e-commerce and AWS cloud services", location: "Hyderabad" },
    { name: "Wipro", industry: "IT Services", website: "https://wipro.com", description: "Global information technology company", location: "Bengaluru" },
  ];

  const companies = [];
  for (const c of companyData) {
    const [existing] = await db.select().from(companiesTable).where(eq(companiesTable.name, c.name));
    if (existing) {
      companies.push(existing);
    } else {
      const [company] = await db.insert(companiesTable).values(c).returning();
      companies.push(company);
      console.log("Company created:", company.name);
    }
  }

  // Job drives
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15).toISOString().split("T")[0];
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const jobData = [
    { title: "Software Engineer", companyId: companies[0].id, description: "Backend development role", minCgpa: 7.0, package: 6.5, location: "Bengaluru", status: "active", driveDate: nextMonth, eligibleDepartments: "CS,IT,ECE" },
    { title: "Systems Engineer", companyId: companies[1].id, description: "Application development and support", minCgpa: 6.5, package: 7.0, location: "Chennai", status: "active", driveDate: nextWeek, eligibleDepartments: "CS,IT,ECE,EEE" },
    { title: "Software Developer (L3)", companyId: companies[2].id, description: "Full-stack development at Google Scale", minCgpa: 8.5, package: 25.0, location: "Hyderabad", status: "active", driveDate: nextMonth, eligibleDepartments: "CS,IT" },
    { title: "SDE-1", companyId: companies[3].id, description: "Backend and distributed systems", minCgpa: 8.0, package: 18.0, location: "Hyderabad", status: "active", driveDate: nextWeek, eligibleDepartments: "CS,IT" },
    { title: "Project Engineer", companyId: companies[4].id, description: "Enterprise application development", minCgpa: 6.0, package: 5.5, location: "Bengaluru", status: "closed", driveDate: "2025-01-15", eligibleDepartments: "ALL" },
  ];

  const jobs = [];
  for (const j of jobData) {
    const [existing] = await db.select().from(jobsTable).where(eq(jobsTable.title, j.title));
    if (existing && existing.companyId === j.companyId) {
      jobs.push(existing);
    } else {
      const [job] = await db.insert(jobsTable).values(j).returning();
      jobs.push(job);
      console.log("Job created:", job.title);
    }
  }

  // Student users + profiles
  const studentData = [
    { email: "arjun.sharma@student.edu", name: "Arjun Sharma", rollNumber: "CS2021001", department: "CS", cgpa: 8.7, phone: "9876543210", skills: "Java, Python, React", tenthPercent: 92, twelfthPercent: 88, status: "active" },
    { email: "priya.nair@student.edu", name: "Priya Nair", rollNumber: "IT2021002", department: "IT", cgpa: 9.2, phone: "9876543211", skills: "Machine Learning, Python, TensorFlow", tenthPercent: 95, twelfthPercent: 91, status: "placed", placedCompany: "Google", placedPackage: 25 },
    { email: "rahul.gupta@student.edu", name: "Rahul Gupta", rollNumber: "ECE2021003", department: "ECE", cgpa: 7.8, phone: "9876543212", skills: "Embedded Systems, C++, VLSI", tenthPercent: 85, twelfthPercent: 82, status: "active" },
    { email: "sneha.patel@student.edu", name: "Sneha Patel", rollNumber: "CS2021004", department: "CS", cgpa: 8.1, phone: "9876543213", skills: "Node.js, MongoDB, React", tenthPercent: 90, twelfthPercent: 87, status: "active" },
    { email: "vikram.rao@student.edu", name: "Vikram Rao", rollNumber: "IT2021005", department: "IT", cgpa: 7.5, phone: "9876543214", skills: "Angular, Spring Boot, MySQL", tenthPercent: 82, twelfthPercent: 79, status: "active" },
  ];

  const studentPass = await bcrypt.hash("student123", 10);
  const students = [];

  for (const s of studentData) {
    const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, s.email));
    let user = existingUser;
    if (!user) {
      [user] = await db.insert(usersTable).values({ email: s.email, passwordHash: studentPass, role: "student" }).returning();
    }

    const [existingStudent] = await db.select().from(studentsTable).where(eq(studentsTable.email, s.email));
    if (existingStudent) {
      students.push(existingStudent);
    } else {
      const [student] = await db.insert(studentsTable).values({ userId: user.id, ...s }).returning();
      students.push(student);
      console.log("Student created:", student.name);
    }
  }

  // Applications
  const appData = [
    { studentId: students[0].id, jobId: jobs[0].id, status: "shortlisted" },
    { studentId: students[0].id, jobId: jobs[1].id, status: "applied" },
    { studentId: students[1].id, jobId: jobs[2].id, status: "selected" },
    { studentId: students[2].id, jobId: jobs[1].id, status: "applied" },
    { studentId: students[3].id, jobId: jobs[0].id, status: "applied" },
    { studentId: students[3].id, jobId: jobs[3].id, status: "shortlisted" },
    { studentId: students[4].id, jobId: jobs[1].id, status: "rejected" },
  ];

  for (const a of appData) {
    const [existing] = await db.select().from(applicationsTable)
      .where(eq(applicationsTable.studentId, a.studentId));
    const alreadyApplied = existing?.jobId === a.jobId;
    if (!alreadyApplied) {
      await db.insert(applicationsTable).values(a).onConflictDoNothing();
      console.log("Application created:", a.studentId, "->", a.jobId, a.status);
    }
  }

  // Notifications
  const notifData = [
    { title: "Welcome to the Placement Portal", message: "Dear students, the placement season 2025-26 has officially begun. Please complete your profiles and upload your resumes.", targetRole: "student" },
    { title: "TCS Drive Next Week", message: "TCS campus drive is scheduled for next week. Students with CGPA >= 6.5 are eligible. Register now!", targetRole: "student" },
    { title: "Google Shortlist Announced", message: "Google SDE-1 shortlist has been published. Check your application status.", targetRole: "student" },
    { title: "Profile Completion Reminder", message: "20% of students have incomplete profiles. Please update your skills and academic details before applying.", targetRole: "student" },
    { title: "Admin: System Update", message: "Placement portal v2 is now live with enhanced features including real-time application tracking.", targetRole: "admin" },
  ];

  for (const n of notifData) {
    const [existing] = await db.select().from(notificationsTable).where(eq(notificationsTable.title, n.title));
    if (!existing) {
      await db.insert(notificationsTable).values(n);
      console.log("Notification created:", n.title);
    }
  }

  console.log("Seeding complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
