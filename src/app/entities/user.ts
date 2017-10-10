export interface IUser {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  authToken: string;
}

export class User implements IUser {
  public id: string;
  public username: string;
  public password: string;
  public firstName: string;
  public lastName: string;
  public authToken: string;

  constructor(user?: IUser) {
    this.id = user.id;
    this.username = user.username;
    this.password = user.password;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.authToken = user.authToken;
  }
}
