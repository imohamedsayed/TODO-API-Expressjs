const AuthErrors = (err) => {
  let errors = {};

  if (err.code == 11000) {
    errors.email = "This email is already exists";
  }

  if (
    err.message.includes("User validation failed") ||
    err.message.includes("Validation failed")
  ) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  // login errors
  if (err.message.includes("Incorrect email")) {
    errors.email = "This email is not registered";
  }
  if (err.message.includes("Incorrect Password")) {
    errors.password = "Password is incorrect";
  }

  if (err.message.includes("Incorrect old Password")) {
    errors.password = "Old password is incorrect";
  }

  let message;
  for (var prop in errors) {
    if (errors[prop]) {
      message = errors[prop];
      break;
    }
  }

  return { errors, message };
};
const TaskErrors = (err) => {
  let errors = {};

  if (err.message.includes("Task validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  let message;
  for (var prop in errors) {
    if (errors[prop]) {
      message = errors[prop];
      break;
    }
  }

  return { errors, message };
};
module.exports = {
  AuthErrors,
  TaskErrors,
};
