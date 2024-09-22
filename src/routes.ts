interface RouteConfig {
  path: string;
  requiresAccessKey: boolean;
  requiresAuthorization: boolean;
}

export const routes: RouteConfig[] = [
  { path: "/api-docs", requiresAccessKey: false, requiresAuthorization: false },
  {
    path: "/user/create",
    requiresAccessKey: false,
    requiresAuthorization: false,
  },
  {
    path: "/user/login",
    requiresAccessKey: false,
    requiresAuthorization: false,
  },
  {
    path: "/user/verify",
    requiresAccessKey: false,
    requiresAuthorization: false,
  },
  {
    path: "/user/forgot-password",
    requiresAccessKey: false,
    requiresAuthorization: false,
  },
  {
    path: "/user/reset-password",
    requiresAccessKey: false,
    requiresAuthorization: false,
  },
  {
    path: "/auth/bearer",
    requiresAccessKey: true,
    requiresAuthorization: true,
  },
  {
    path: "/user/email-available",
    requiresAccessKey: true,
    requiresAuthorization: true,
  },
  {
    path: "/user/username-available",
    requiresAccessKey: true,
    requiresAuthorization: true,
  },
  { path: "/user/users", requiresAccessKey: true, requiresAuthorization: true },
  {
    path: "/user/delete-all",
    requiresAccessKey: true,
    requiresAuthorization: true,
  },
  {
    path: "/streams/file",
    requiresAccessKey: true,
    requiresAuthorization: true,
  },
  {
    path: "/user/journal/create",
    requiresAccessKey: false,
    requiresAuthorization: true,
  },
  {
    path: "/user/journal/edit",
    requiresAccessKey: false,
    requiresAuthorization: true,
  },
  {
    path: "/user/journal/journals",
    requiresAccessKey: false,
    requiresAuthorization: true,
  },
  {
    path: "/user/journal/delete",
    requiresAccessKey: false,
    requiresAuthorization: true,
  },
  {
    path: "/user/journal/category/create",
    requiresAccessKey: false,
    requiresAuthorization: true,
  },
  {
    path: "/user/journal/category/create-many",
    requiresAccessKey: false,
    requiresAuthorization: true,
  },
  {
    path: "/user/journal/category/edit",
    requiresAccessKey: false,
    requiresAuthorization: true,
  },
  {
    path: "/user/journal/category/delete",
    requiresAccessKey: false,
    requiresAuthorization: true,
  },
];

// You can now easily generate the lists you need:
export const excludeFromAccessKeyVerification = routes
  .filter((route) => !route.requiresAccessKey)
  .map((route) => route.path);

export const excludeFromAuthorizationVerification = routes
  .filter((route) => !route.requiresAuthorization)
  .map((route) => route.path);

export const routesRequiringAccessKey = routes
  .filter((route) => route.requiresAccessKey)
  .map((route) => route.path);


export const routesRequiringAuthorization = routes
  .filter((route) => route.requiresAuthorization)
  .map((route) => route.path);

export const checkConflictingRouteMiddleware = () => {
  // Check for conflicting configurations
  const conflictingAccessKeyRoutes = routesRequiringAccessKey.filter((route) =>
    excludeFromAuthorizationVerification.includes(route)
  );

  const conflictingAuthorizationRoutes = routesRequiringAuthorization.filter(
    (route) => excludeFromAuthorizationVerification.includes(route)
  );

  const conflictingPaths = [
    ...conflictingAccessKeyRoutes,
    ...conflictingAuthorizationRoutes,
  ].join(", ");

  if (conflictingPaths.length > 0) {
    throw new Error(
      `Conflicting route configurations found for: ${conflictingPaths}. ` +
        `These routes have inconsistent access key and authorization requirements.`
    );
  }
};
