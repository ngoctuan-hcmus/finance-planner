import { createAuthClient } from "better-auth/react";

// Dùng trong Client Component (trình duyệt) để gọi /api/auth/...
export const authClient = createAuthClient();