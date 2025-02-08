class User {
  constructor(user) {
    this.email = user.email;
    this._id = user._id;
    this.fullName = user.fullName;
    this.addresses = user.addresses;
    this.profilePhoto = user.profilePhoto;
    this.lives = user.lives;
    this.birthday = user.birthday;
    this.school = user.school;
    this.works = user.works;
    this.twoFAEnabled = user.twoFAEnabled;
  }
}

module.exports = User;
