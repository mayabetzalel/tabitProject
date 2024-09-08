import express from "express";

import connectDB from "./db/db.js";
import bookRoutes from "./routes/books.js";
import userRoutes from "./routes/users.js";

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use the books API routes
app.use(userRoutes)
app.use(bookRoutes)

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});