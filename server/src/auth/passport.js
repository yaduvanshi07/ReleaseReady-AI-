import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'releaseready-jwt-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Configure Passport strategies
 * @param {import('better-sqlite3').Database} [db]
 */
export function configurePassport(db = null) {
  const userRepo = new UserRepository(db);

  // 1. Local Strategy (Email + Password)
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        session: false
      },
      (email, password, done) => {
        try {
          const user = userRepo.findByEmail(email);
          if (!user) {
            return done(null, false, { message: 'Invalid email or password.' });
          }

          const isValid = userRepo.validatePassword(user, password);
          if (!isValid) {
            return done(null, false, { message: 'Invalid email or password.' });
          }

          const sanitizedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          };

          return done(null, sanitizedUser);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // 2. JWT Strategy (Bearer Token)
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      (req) => (req.headers && req.headers['x-auth-token']) || null
    ]),
    secretOrKey: JWT_SECRET
  };

  passport.use(
    new JwtStrategy(jwtOptions, (jwtPayload, done) => {
      try {
        const user = userRepo.findById(jwtPayload.id);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    })
  );

  return passport;
}

/**
 * Generates signed JWT token for authenticated user
 * @param {Object} user
 * @returns {string} Signed JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Optional authentication middleware: populates req.user if token is present, continues without error if not
 */
export function optionalAuth(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
}

/**
 * Required authentication middleware: returns 401 if token is invalid or missing
 */
export function requireAuth(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Authentication required. Please log in.',
          code: 'UNAUTHORIZED'
        }
      });
    }
    req.user = user;
    next();
  })(req, res, next);
}
