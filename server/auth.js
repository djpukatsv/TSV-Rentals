import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';
import { Users } from './db.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET || 'tsv-rentals-secret';

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET); } catch {}
  }
  next();
}

export function registerRoutes(app) {

  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, phone, role } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
    const existing = Users.findByEmail.get(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const id = randomUUID();
    const userRole = role === 'agent' ? 'agent' : role === 'landlord' ? 'landlord' : 'user';
    Users.create.run(id, email, hashed, name, phone || null, userRole);
    const token = jwt.sign({ id, email, name, role: userRole }, JWT_SECRET, { expiresIn: '30d' });

    try {
      await resend.emails.send({
        from: 'TSV Rentals <noreply@tsvrentals.com.au>',
        to: email,
        subject: 'Welcome to TSV Rentals!',
        html: `
          <h2>Welcome to TSV Rentals, ${name}!</h2>
          <p>Thanks for joining Townsville's own rental platform.</p>
          <p>You can now list properties, save favourites and enquire on listings.</p>
          <p>— The TSV Rentals Team</p>
        `,
      });
    } catch {}

    res.status(201).json({ token, user: { id, email, name, role: userRole } });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const user = Users.findByEmail.get(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = Users.findById.get(req.user.id);
    res.json({ user });
  });

}
