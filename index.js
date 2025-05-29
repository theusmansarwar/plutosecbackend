require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");
const connectDB = require("./utils/db");

const app = express();
const port = process.env.PORT || 4000;

// ✅ Clean Allowed Origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3001",
  "https://plutosec.ca",
  "https://www.plutosec.ca",
  "https://pl0tu.plutosec.ca",
  "https://crm.plutosec.ca",
];

// ✅ CORS Options
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin"));
    }
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
};

// ✅ Apply CORS Middleware (must come before routes)
app.use(cors(corsOptions));

// ✅ Preflight Requests (use same corsOptions!)
app.options("*", cors(corsOptions));

// ✅ Middleware
app.use(express.json());

// ✅ Routes
const userRouter = require("./Routes/userRoutes");
const blogRouter = require("./Routes/blogRoutes");
const commentRouter = require("./Routes/commentRoutes");
const categoryRouter = require("./Routes/categoryRoutes");
const UsertypeRouter = require("./Routes/typeRoutes");
const testimonialRouter = require("./Routes/testimonialRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const viewsRouter = require("./Routes/viewsRoutes");
const applicationRoutes = require("./Routes/applicationRoutes");
const newsletterRoutes= require("./Routes/newsletterRoutes")
const ticketsRoutes= require("./Routes/ticketRoutes")
const chatsRoutes= require("./Routes/chatsRoutes")
app.use("/", userRouter);
app.use("/admin", adminRoutes);
app.use("/blog", blogRouter);
app.use("/comment", commentRouter);
app.use("/category", categoryRouter);
app.use("/usertype", UsertypeRouter);
app.use("/testimonial", testimonialRouter);
app.use("/views", viewsRouter);
app.use("/applications", applicationRoutes);
app.use("/newsletter", newsletterRoutes);
app.use("/ticket", ticketsRoutes);
app.use("/chat", chatsRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server is running on Port: ${port}`);
  });
});
