import { Router } from "express";
import { db, addAudit } from "../data/db.js";
import { DEFAULT_PASSWORD } from "../data/seed.js";

const router = Router();

router.post("/login", (req, res) => {
  const { email, password, role } = req.body;
  const user = db.users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase()
  );
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  if (role && user.role !== role) {
    return res.status(401).json({ error: "Role does not match this account." });
  }
  addAudit({ user: user.name, role: user.role, action: "Logged in", module: "Auth", recordId: "-" });
  const { password: _pw, ...safeUser } = user;
  res.json({ user: safeUser, token: "demo-token-" + user.id });
});

router.post("/change-password", (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "Email, current password and new password are required." });
  }

  const user = db.users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase()
  );

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (user.password !== currentPassword) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters long." });
  }

  user.password = newPassword;
  addAudit({
    user: user.name,
    role: user.role,
    action: `Updated password`,
    module: "Auth",
    recordId: user.id,
  });

  const { password: _pw, ...safeUser } = user;
  res.json({ user: safeUser, message: "Password updated successfully." });
});

router.get("/demo-accounts", (_req, res) => {
  res.json(
    db.users.map((u) => ({ email: u.email, role: u.role, name: u.name, password: u.password, defaultPassword: DEFAULT_PASSWORD }))
  );
});

export default router;
