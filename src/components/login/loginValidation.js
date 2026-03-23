export const loginValidation = (values) => {
  const { username, password } = values;

  if ((!username) && (!password)) {
    return { errorStatus: true, errorMessage: "Please enter username and password" }
  }
  if ((!username) && (password)) {
    return { errorStatus: true, errorMessage: "Username is required" };
  }
  if ((username) && (!password)) {
    return { errorStatus: true, errorMessage: "Password is required" };
  }

  // Check if username length is equal to 7 characters.
 

  // Check for non-numeric charaters.
  const regex = /^[ A-Za-z0-9_@./#&+-]*$/;
  if (username && !regex.test(username)) {
    return { errorStatus: true, errorMessage: "Username should contain only alphanumeric" };
  }

  return { errorStatus: false, errorMessage: "" };
};

export const serverValidation = (value) => {
  if (value !== undefined) {
    return { errorStatus: true, errorMessage: value.message };
  }
  return { errorStatus: false };
};