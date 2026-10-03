import passport from 'passport';
import { z } from 'zod';
import { UserRepository } from '../repositories/userRepository.js';
import { generateToken } from '../auth/passport.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  role: z.enum(['engineer', 'qa_lead', 'product_manager', 'release_manager', 'admin']).optional().default('engineer')
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export class AuthController {
  constructor(userRepo = null) {
    this.userRepo = userRepo || new UserRepository();
  }

  register = (req, res, next) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        const issues = parsed.error.issues.map(i => `${i.path.join('.') || 'field'}: ${i.message}`).join('; ');
        return res.status(400).json({
          error: {
            message: `Registration failed: ${issues}`,
            code: 'VALIDATION_ERROR',
            details: parsed.error.format()
          }
        });
      }

      const { name, email, password, role } = parsed.data;

      const existingUser = this.userRepo.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: {
            message: 'An account with this email address already exists. Please log in.',
            code: 'EMAIL_EXISTS'
          }
        });
      }

      const user = this.userRepo.create({ name, email, password, role });
      const token = generateToken(user);

      res.status(201).json({
        message: 'Account created successfully.',
        user,
        token
      });
    } catch (err) {
      next(err);
    }
  };

  login = (req, res, next) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map(i => `${i.path.join('.') || 'field'}: ${i.message}`).join('; ');
      return res.status(400).json({
        error: {
          message: `Login failed: ${issues}`,
          code: 'VALIDATION_ERROR',
          details: parsed.error.format()
        }
      });
    }

    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({
          error: {
            message: info?.message || 'Invalid email or password.',
            code: 'INVALID_CREDENTIALS'
          }
        });
      }

      const token = generateToken(user);
      res.json({
        message: 'Login successful.',
        user,
        token
      });
    })(req, res, next);
  };

  me = (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Not authenticated.',
            code: 'UNAUTHORIZED'
          }
        });
      }

      const user = this.userRepo.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          error: {
            message: 'User account not found.',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      res.json({ user });
    } catch (err) {
      next(err);
    }
  };

  demoLogin = (req, res, next) => {
    try {
      const role = req.body?.role || 'engineer';
      const demoEmail = role === 'qa_lead' ? 'reviewer@releaseready.ai' : 'demo@releaseready.ai';
      
      let user = this.userRepo.findByEmail(demoEmail);
      if (!user) {
        // Create demo account on the fly if not yet seeded
        user = this.userRepo.create({
          name: role === 'qa_lead' ? 'Sarah Connor (QA Lead)' : 'Alex Rivera (Engineering Lead)',
          email: demoEmail,
          password: 'Password123!',
          role: role === 'qa_lead' ? 'qa_lead' : 'engineer'
        });
      }

      const sanitizedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      };

      const token = generateToken(sanitizedUser);
      res.json({
        message: 'Demo login successful.',
        user: sanitizedUser,
        token
      });
    } catch (err) {
      next(err);
    }
  };
}
