// Importo todo lo de la libreria de Express
import express from "express";
import cookieParser from "cookie-parser";
import productsRoutes from "./src/routes/products.js";
import customersRoutes from "./src/routes/customers.js";
import employeeRoutes from "./src/routes/employees.js";
import branchesRoutes from "./src/routes/branches.js";
import reviewsRoutes from "./src/routes/reviews.js";
import registerEmployeesRoutes from "./src/routes/registerEmployees.js";
import loginRoutes from "./src/routes/login.js";
import logoutRoutes from "./src/routes/logout.js";
import registerClients from "./src/routes/registerClients.js";
import passwordRecoveryRoutes from "./src/routes/passwordRecovery.js";
import blogRoutes from "./src/routes/blog.js";
import salesRoutes from "./src/routes/sales.js";
import { validateAuthToken } from "./src/middlewares/validateAuthToken.js";

const app = express();

app.use(express.json());                        // JSON -> req.body
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded

// Cookies
app.use(cookieParser());

// Rutas (las protegidas con tu middleware donde aplique)
app.use("/api/products", validateAuthToken(["Admin"]), productsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/branches", branchesRoutes);
app.use("/api/reviews", reviewsRoutes);

app.use("/api/registerEmployees", registerEmployeesRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/logout", logoutRoutes);

app.use("/api/registerClients", registerClients);
app.use("/api/passwordRecovery", passwordRecoveryRoutes);

app.use("/api/blog", blogRoutes);
app.use("/api/sales", salesRoutes);

export default app;
