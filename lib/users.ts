// Mock users database - imported from auth.ts
let users = [
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

let nextUserId = users.length + 1

export async function getUsers() {
  // In a real app, this would fetch from a database
  // We don't want to expose passwords
  return users.map((user) => {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  })
}

export async function addUser(userData) {
  // Generate a new ID
  const newId = String(nextUserId++)

  // Create the new user
  const newUser = {
    id: newId,
    ...userData,
    lastLogin: null,
  }

  // Add to the mock database
  users.push(newUser)

  // Don't return the password
  const { password, ...userWithoutPassword } = newUser
  return userWithoutPassword
}

export async function updateUser(userData) {
  // Find the user to update
  const index = users.findIndex((u) => u.id === userData.id)

  if (index !== -1) {
    // Update the user, preserving the password
    users[index] = {
      ...users[index],
      ...userData,
    }

    // Don't return the password
    const { password, ...userWithoutPassword } = users[index]
    return userWithoutPassword
  }

  throw new Error("User not found")
}

export async function deleteUser(userId) {
  // Find the user to delete
  const index = users.findIndex((u) => u.id === userId)

  if (index !== -1) {
    // Remove the user
    const deletedUser = users[index]
    users = users.filter((u) => u.id !== userId)

    // Don't return the password
    const { password, ...userWithoutPassword } = deletedUser
    return userWithoutPassword
  }

  throw new Error("User not found")
}

export async function resetUserPassword(userId, newPassword) {
  // Find the user
  const index = users.findIndex((u) => u.id === userId)

  if (index !== -1) {
    // Update the password
    users[index].password = newPassword

    return { success: true }
  }

  throw new Error("User not found")
}
