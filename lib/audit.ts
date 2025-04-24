// Mock audit logs service

// Mock audit logs database
const auditLogs = [
  {
    id: "1",
    timestamp: "2023-04-22T08:30:00Z",
    userId: "1",
    username: "admin",
    action: "login",
    details: "User logged in",
    ipAddress: "192.168.1.1",
  },
  {
    id: "2",
    timestamp: "2023-04-22T09:15:00Z",
    userId: "1",
    username: "admin",
    action: "product_created",
    details: 'Product "Organic Coffee Beans" created',
    ipAddress: "192.168.1.1",
  },
  {
    id: "3",
    timestamp: "2023-04-22T10:45:00Z",
    userId: "2",
    username: "cashier",
    action: "login",
    details: "User logged in",
    ipAddress: "192.168.1.2",
  },
  {
    id: "4",
    timestamp: "2023-04-22T11:30:00Z",
    userId: "2",
    username: "cashier",
    action: "sale_completed",
    details: "Sale #S001 completed for $125.99",
    ipAddress: "192.168.1.2",
  },
  {
    id: "5",
    timestamp: "2023-04-22T12:15:00Z",
    userId: "1",
    username: "admin",
    action: "inventory_adjusted",
    details: 'Adjusted inventory for "Wireless Earbuds" by 5 units. Reason: Restocking',
    ipAddress: "192.168.1.1",
  },
]

let nextLogId = auditLogs.length + 1

export async function getAuditLogs(timeRange = "all", actionType = "all") {
  // In a real app, this would fetch from a database with proper filtering
  let filteredLogs = [...auditLogs]

  // Filter by action type if specified
  if (actionType !== "all") {
    filteredLogs = filteredLogs.filter((log) => log.action.includes(actionType))
  }

  // Sort by timestamp (newest first)
  return filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export async function logAction({ action, details, userId, username }) {
  // In a real app, this would write to a database
  const newLog = {
    id: String(nextLogId++),
    timestamp: new Date().toISOString(),
    userId,
    username,
    action,
    details,
    ipAddress: "192.168.1." + Math.floor(Math.random() * 255 + 1), // Mock IP address
  }

  auditLogs.push(newLog)

  return newLog
}
