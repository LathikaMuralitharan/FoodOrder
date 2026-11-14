import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  findUserByEmail,
  stripPassword,
  createJwtToken,
} from '../../../server/data/usersData.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Allow POST requests only
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse request body
  let body: any = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
  }

  const email = (body?.email ?? '').trim();
  const password = body?.password ?? '';

  // Validation
  if (!email && !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  // Authenticate user
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }

  // Generate safe user and JWT token
  const safeUser = stripPassword(user);
  const token = createJwtToken(safeUser);

  return res.status(200).json({
    data: {
      user: safeUser,
      token,
    },
    message: 'Login successful',
  });
}
