// Mock database for simulating user data
export const mockUsers = [
  {
    id: 1,
    firstName: "Emma",
    lastName: "Watson",
    phone: "901234567",
    email: "emma@example.com",
    password: "111111"
  },
  {
    id: 2,
    firstName: "John",
    lastName: "Smith",
    phone: "90000000",
    email: "john@example.com",
    password: "password123"
  },
  {
    id: 3,
    firstName: "Anvar",
    lastName: "Karimov",
    phone: "901234568",
    email: "anvar@example.com",
    password: "mypassword"
  },
  {
    id: 4,
    firstName: "Malika",
    lastName: "Tosheva",
    phone: "901234569",
    email: "malika@example.com",
    password: "secret123"
  }
];

// Function to check if user exists by phone or email
export function findUserByPhoneOrEmail(phoneOrEmail) {
  // Clean phone number (remove spaces and +998)
  const cleanInput = phoneOrEmail.replace(/[\s+]/g, '').replace('998', '');

  return mockUsers.find(user => {
    // Check phone (compare cleaned versions)
    const cleanUserPhone = user.phone.replace(/[\s+]/g, '');
    if (cleanInput === cleanUserPhone) {
      return true;
    }

    // Check email
    if (phoneOrEmail.toLowerCase() === user.email.toLowerCase()) {
      return true;
    }

    return false;
  });
}

// Function to register new user
export function registerUser(userData) {
  const newUser = {
    id: mockUsers.length + 1,
    ...userData
  };

  mockUsers.push(newUser);
  return newUser;
}

// Function to authenticate user
export function authenticateUser(phoneOrEmail, password) {
  const user = findUserByPhoneOrEmail(phoneOrEmail);

  if (user && user.password === password) {
    return user;
  }

  return null;
}