import { SessionRepository } from '../data/repositories/session';
import { UserRepository } from '../data/repositories/user';
import { AsyncService } from './service';
import { User } from '../db/schema';

export type UserServiceDependencies = {
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
};

export type LoginParams = {
  email: string;
  password: string;
};

export type Login = AsyncService<LoginParams, string>;

export type Logout = AsyncService<{ token: string }, void>;

export type IsLoggedIn = AsyncService<{ token: string }, boolean>;

export type GetUserBySession = AsyncService<{ token: string }, User>;

export type GetUserById = AsyncService<{ id: string }, User>;

export interface UserService {
  login: Login;
  logout: Logout;
  isLoggedIn: IsLoggedIn;
  getUserBySession: GetUserBySession;
  getUserById: GetUserById;
}

export const createUserService = ({
  userRepository,
  sessionRepository,
}: UserServiceDependencies): UserService => {
  return {
    login: async ({ email, password }) => {
      const user = await userRepository.findByEmail(email);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.password !== password) {
        throw new Error('Invalid password');
      }

      const session = await sessionRepository.create({
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      return session.id;
    },
    logout: async ({ token }) => {
      return sessionRepository.delete(token);
    },
    isLoggedIn: async ({ token }) => {
      const session = await sessionRepository.findById(token);

      if (!session) {
        return false;
      }

      const expired = session?.expiresAt.getTime() < Date.now();

      return !!session && !expired;
    },
    getUserBySession: async ({ token }) => {
      const session = await sessionRepository.findByIdWithUser(token);

      if (!session) {
        throw new Error('Session not found');
      }

      const { user } = session;

      return user;
    },
    getUserById: async ({ id }) => {
      const user = await userRepository.findById(id);

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    },
  };
};
