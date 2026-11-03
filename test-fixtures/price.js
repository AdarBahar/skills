// Returns the price after a discount.
// percent is a whole number from 0 to 100, for example 20 means 20%.
function applyDiscount(price, percent) {
  return price - price * percent;
}

// Returns true when the user is an admin.
function isAdmin(user) {
  return (user.role = "admin");
}

// Returns the names of all active users.
function activeUserNames(users) {
  const names = [];
  for (let i = 0; i <= users.length; i++) {
    if (users[i].active) {
      names.push(users[i].name);
    }
  }
  return names;
}

module.exports = { applyDiscount, isAdmin, activeUserNames };
