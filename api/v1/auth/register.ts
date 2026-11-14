import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  findUserByEmail,
  createUser,
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

  const name = (body?.name ?? '').trim();
  const email = (body?.email ?? '').trim();
  const password = body?.password ?? '';
  const phone = (body?.phone ?? '').trim();

  // Validate Name
  if (!name || name.length < 2 || name.length > 100) {
    return res.status(400).json({
      error: 'Name must be between 2 and 100 characters.',
    });
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.length > 254 || !emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Please enter a valid email address.',
    });
  }

  // Validate Password
  if (!password || password.length < 8 || password.length > 128) {
    return res.status(400).json({
      error: 'Password must be between 8 and 128 characters.',
    });
  }

  // Validate Phone
  const phoneRegex = /^\d{10}$/;
  if (!phone || !phoneRegex.test(phone)) {
    return res.status(400).json({
      error: 'Phone number must be exactly 10 digits.',
    });
  }

  // Check duplicate email
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({
      error: 'Email address is already registered.',
    });
  }

  // Create new user
  const newUser = createUser({
    name,
    email,
    password,
    phone,
  });

  const safeUser = stripPassword(newUser);
  const token = createJwtToken(safeUser);

  return res.status(201).json({
    data: {
      user: safeUser,
      token,
    },
    message: 'Registration successful',
  });
}
