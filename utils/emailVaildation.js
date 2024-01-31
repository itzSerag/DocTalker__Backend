

exports.validateEmail = (email) => {
    // this regular expression is taken from https://stackoverflow.com/a/46181/1127314
    // to ensure the basic format of an email is correct

    //TODO : use it in mongoose model validation insted of the package
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }