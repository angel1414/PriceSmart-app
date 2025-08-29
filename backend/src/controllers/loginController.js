// src/controllers/loginController.js
import CustomersModel from "../models/customers.js";
import EmployeesModel from "../models/employee.js";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";

const loginController = {};

const maxAttempts = 3;
const lockTime = 15 * 60 * 1000; // 15 minutos

loginController.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email y password son obligatorios" });
    }

    let userFound = null;
    let userType = null;

    // 1) Admin (usa credenciales de .env)
    if (email === config.emailAdmin.email && password === config.emailAdmin.password) {
      userType = "Admin";
      userFound = { _id: "Admin" }; // objeto mínimo
    } else {
      // 2) Empleado
      userFound = await EmployeesModel.findOne({ email });
      userType = "Employee";

      // 3) Cliente
      if (!userFound) {
        userFound = await CustomersModel.findOne({ email });
        userType = "Customer";
      }
    }

    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }

    // Bloqueo por intentos fallidos (no aplica a Admin)
    if (userType !== "Admin") {
      // Asegura valores por defecto
      userFound.loginAttempts = userFound.loginAttempts ?? 0;
      userFound.lockTime = userFound.lockTime ?? null;

      if (userFound.lockTime && userFound.lockTime > Date.now()) {
        const minutosRestantes = Math.ceil((userFound.lockTime - Date.now()) / 60000);
        return res.status(403).json({
          message: `Cuenta bloqueada, intenta de nuevo en ${minutosRestantes} minuto(s)`,
        });
      }
    }

    // Validación de contraseña (no aplica a Admin)
    if (userType !== "Admin") {
      const isMatch = await bcryptjs.compare(password, userFound.password);
      if (!isMatch) {
        userFound.loginAttempts = (userFound.loginAttempts ?? 0) + 1;

        if (userFound.loginAttempts >= maxAttempts) {
          userFound.lockTime = Date.now() + lockTime;
          await userFound.save();
          return res.status(403).json({ message: "Usuario bloqueado por intentos fallidos" });
        }

        await userFound.save();
        return res.status(401).json({ message: "Invalid password" });
      }

      // Password correcta: reset de intentos/bloqueo
      userFound.loginAttempts = 0;
      userFound.lockTime = null;
      await userFound.save();
    }

    // Generar token (¡ahora sí lo guardamos en una variable!)
    if (!config.JWT?.secret) {
      return res.status(500).json({ message: "JWT_SECRET no configurado" });
    }

    const payload = { id: userFound._id, userType };
    const token = jsonwebtoken.sign(payload, config.JWT.secret, {
      expiresIn: config.JWT.expiresIn || "30d",
    });

    // Cookie (opcional) + respuesta JSON
    res.cookie("authToken", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,             // true si usas HTTPS
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "login successful",
      token,                      // útil para Postman / front
      user: { id: payload.id, role: userType, email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Error en login", error: error.message });
  }
};

export default loginController;
