import { UserService } from '../../services/user';

export type isAuthenticatedDependencies = {
  userService: UserService;
};

export const createIsAuthenticated =
  ({ userService }: isAuthenticatedDependencies) =>
  async (token: string): Promise<boolean> => {
    const isLoggedIn = await userService.isLoggedIn({ token });
    return isLoggedIn;
  };
