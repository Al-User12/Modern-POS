// Mock authentication service

// Mock user database
const users = [
  {
    id: "1",
    username: "admin",
    name: "Admin Sistem",
    email: "admin@example.com",
    password: "admin", // In a real app, this would be hashed
    role: "admin",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "2",
    username: "cashier",
    name: "Kasir Utama",
    email: "kasir@example.com",
    password: "cashier", // In a real app, this would be hashed
    role: "cashier",
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock session storage
let currentUser = null

export async function authenticateUser(username: string, password: string) {
  // In a real app, this would verify against a database with proper password hashing
  const user = users.find((u) => u.username === username && u.password === password)

  if (user) {
    // Update last login time
    user.lastLogin = new Date().toISOString()

    // Store in session (in a real app, this would be a proper session or JWT)
    currentUser = { ...user }
    delete currentUser.password // Don't include password in session

    return { success: true, user: currentUser }
  }

  return { success: false }
}

export async function getCurrentUser() {
  // In a real app, this would verify a session token or JWT
  return currentUser
}

export async function logout() {
  // Clear the session
  currentUser = null
  return { success: true }
}

// For demo purposes only - these would be proper API endpoints in a real app
export async function isAuthenticated() {
  return !!currentUser
}

export async function hasPermission(permission: string) {
  if (!currentUser) return false

  // Simple role-based permissions
  if (permission === "admin" && currentUser.role === "admin") {
    return true
  }

  if (permission === "pos" && (currentUser.role === "admin" || currentUser.role === "cashier")) {
    return true
  }

  return false
}
