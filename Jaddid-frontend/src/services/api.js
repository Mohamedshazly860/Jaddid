// API Configuration and Base Service with Mock User Management
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Mock user storage for offline mode
const getStoredUsers = () => {
  const stored = localStorage.getItem("mock_users");
  let users = stored ? JSON.parse(stored) : [];

  // Add some default users for testing (simulate admin panel users)
  const defaultUsers = [
    {
      id: 1,
      email: "admin@example.com",
      first_name: "Admin",
      last_name: "User",
      password: "admin123",
      role: "admin",
      created_at: "2024-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      email: "user@example.com",
      first_name: "Regular",
      last_name: "User",
      password: "user123",
      role: "user",
      created_at: "2024-01-01T00:00:00.000Z",
    },
    {
      id: 3,
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      password: "test123",
      role: "user",
      created_at: "2024-01-01T00:00:00.000Z",
    },
    {
      id: 4,
      email: "abdelrhmanadnan3@jadid.com",
      first_name: "Abdelrhman",
      last_name: "Adnan",
      password: "password123",
      role: "user",
      created_at: "2024-01-01T00:00:00.000Z",
    },
  ];

  // Add default users if they don't exist
  defaultUsers.forEach((defaultUser) => {
    if (!users.some((user) => user.email === defaultUser.email)) {
      users.push(defaultUser);
    }
  });

  // Save updated users back to localStorage
  localStorage.setItem("mock_users", JSON.stringify(users));

  return users;
};

const saveStoredUsers = (users) => {
  localStorage.setItem("mock_users", JSON.stringify(users));
};

const addMockUser = (userData) => {
  const users = getStoredUsers();
  const newUser = {
    id: Date.now(),
    email: userData.email,
    first_name: userData.first_name || "",
    last_name: userData.last_name || "",
    password: userData.password, // In real app, this would be hashed
    role: "user",
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  saveStoredUsers(users);
  return newUser;
};

const findMockUser = (email, password) => {
  const users = getStoredUsers();
  return users.find(
    (user) => user.email === email && user.password === password
  );
};

// Helper functions for development (available in browser console)
const addMockUserFromConsole = (
  email,
  password,
  firstName = "",
  lastName = "",
  role = "user"
) => {
  try {
    console.log(`🔄 Adding user: ${email}`);
    const users = getStoredUsers();
    console.log(`📊 Current users count: ${users.length}`);

    if (users.some((user) => user.email === email)) {
      console.log(`❌ User with email ${email} already exists`);
      return false;
    }

    const newUser = {
      id: Date.now(),
      email,
      first_name: firstName,
      last_name: lastName,
      password,
      role,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    saveStoredUsers(users);

    console.log(`✅ User ${email} added successfully`);
    console.log("User details:", newUser);

    // Verify the user was added
    const verifyUsers = getStoredUsers();
    const addedUser = verifyUsers.find((u) => u.email === email);
    if (addedUser) {
      console.log("✅ User verified in storage");
    } else {
      console.log("❌ User not found in storage after adding!");
    }

    return true;
  } catch (error) {
    console.error("❌ Error adding user:", error);
    return false;
  }
};

const checkMockUser = (email) => {
  const users = getStoredUsers();
  const user = users.find((u) => u.email === email);
  if (user) {
    console.log(`✅ User ${email} found:`, {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      role: user.role,
      password: user.password,
      created: user.created_at,
    });
    return user;
  } else {
    console.log(`❌ User ${email} not found in ${users.length} users`);
    console.log(
      "Available users:",
      users.map((u) => u.email)
    );
    return null;
  }
};

const updateMockUserPassword = (email, newPassword) => {
  const users = getStoredUsers();
  const userIndex = users.findIndex((u) => u.email === email);
  if (userIndex === -1) {
    console.log(`❌ User ${email} not found`);
    return false;
  }
  users[userIndex].password = newPassword;
  saveStoredUsers(users);
  console.log(`✅ Password updated for ${email}`);
  return true;
};

const listMockUsers = () => {
  const users = getStoredUsers();
  console.log("📋 Current Mock Users:");
  console.table(
    users.map((user) => ({
      ID: user.id,
      Email: user.email,
      Name: `${user.first_name} ${user.last_name}`,
      Role: user.role,
      Password: user.password,
      Created: new Date(user.created_at).toLocaleDateString(),
    }))
  );
  return users;
};

const clearMockUsers = () => {
  localStorage.removeItem("mock_users");
  console.log("🗑️ All mock users cleared");
};

// Make functions available in browser console for development
if (typeof window !== "undefined") {
  window.addMockUser = addMockUserFromConsole;
  window.listMockUsers = listMockUsers;
  window.clearMockUsers = clearMockUsers;
  window.checkMockUser = checkMockUser;
  window.updateMockUserPassword = updateMockUserPassword;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend is not available, return mock responses
    if (error.code === "ERR_NETWORK") {
      console.warn(
        "Backend not available, using mock response for:",
        error.config.url
      );

      // Mock login response
      if (error.config.url.includes("/accounts/login/")) {
        const requestData = JSON.parse(error.config.data || "{}");
        const { email, password } = requestData;

        console.log(`🔍 Login attempt for: ${email}`);
        console.log(`📊 Checking ${getStoredUsers().length} users in storage`);

        // First try to find user in mock storage
        const mockUser = findMockUser(email, password);
        if (mockUser) {
          console.log(`✅ User ${email} authenticated successfully`);
          return Promise.resolve({
            data: {
              tokens: {
                access: "mock_access_token_" + mockUser.id,
                refresh: "mock_refresh_token_" + mockUser.id,
              },
              user: {
                id: mockUser.id,
                email: mockUser.email,
                first_name: mockUser.first_name,
                last_name: mockUser.last_name,
                role: mockUser.role,
              },
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config: error.config,
          });
        }

        // If not found in mock storage, return authentication error
        console.log(`❌ User ${email} not found or password incorrect`);
        console.log(
          `💡 Available users:`,
          getStoredUsers().map((u) => `${u.email} (${u.password})`)
        );
        return Promise.reject({
          response: {
            status: 401,
            data: {
              detail: "Invalid credentials. User not found in mock storage.",
            },
          },
        });
      }

      // Mock register response
      if (error.config.url.includes("/accounts/register/")) {
        const requestData = JSON.parse(error.config.data || "{}");
        const users = getStoredUsers();

        // Check if user already exists
        if (users.some((user) => user.email === requestData.email)) {
          return Promise.reject({
            response: {
              status: 400,
              data: { email: ["User with this email already exists."] },
            },
          });
        }

        // Create new mock user
        const newUser = addMockUser(requestData);
        return Promise.resolve({
          data: {
            tokens: {
              access: "mock_access_token_" + newUser.id,
              refresh: "mock_refresh_token_" + newUser.id,
            },
            user: {
              id: newUser.id,
              email: newUser.email,
              first_name: newUser.first_name,
              last_name: newUser.last_name,
              role: newUser.role,
            },
          },
          status: 201,
          statusText: "Created",
          headers: {},
          config: error.config,
        });
      }

      // Mock notifications responses
      if (error.config.url.includes("/community/notifications/unread-count/")) {
        return Promise.resolve({
          data: { count: 0 },
          status: 200,
          statusText: "OK",
          headers: {},
          config: error.config,
        });
      }

      if (
        error.config.url.includes("/community/notifications/") &&
        !error.config.url.includes("/unread-count/")
      ) {
        return Promise.resolve({
          data: [],
          status: 200,
          statusText: "OK",
          headers: {},
          config: error.config,
        });
      }

      // For other endpoints, return empty data to prevent crashes
      return Promise.resolve({
        data: { results: [], count: 0 },
        status: 200,
        statusText: "OK",
        headers: {},
        config: error.config,
      });
    }

    if (error.response?.status === 401) {
      // Only redirect to login if we're on a protected page that requires auth
      const currentPath = window.location.pathname;
      const publicPaths = ["/", "/marketplace", "/login", "/register"];

      // Check if current path is exactly a public path or starts with it
      const isPublicPath = publicPaths.some(
        (path) => currentPath === path || currentPath.startsWith(path + "/")
      );

      if (!isPublicPath) {
        // Protected page - redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      // If public page, just reject the error without redirecting
      // This allows the page to handle 401s gracefully (e.g., hide favorites if not logged in)
    }
    return Promise.reject(error);
  }
);

export default api;
