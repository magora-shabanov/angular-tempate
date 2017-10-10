import {
  BaseRequestOptions,
  Http,
  RequestMethod,
  RequestOptions,
  Response,
  ResponseOptions,
  XHRBackend
} from '@angular/http';

import { MockBackend, MockConnection } from '@angular/http/testing';
import { IUser, User } from '../entities/user';
import { backendRoutes } from '../_services/http/http.service';

const stdUser = {} as IUser;
stdUser.id = 'cc65713c-46fe-4a3a-9233-5fbec0c12737';
stdUser.username = 'test';
stdUser.password = 'test';
stdUser.firstName = 'Test';
stdUser.lastName = 'User';
stdUser.authToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxk' +
  'ZXIiLCJpYXQiOjE1MDYyNTI3MTUsImV4cCI6MTUzNzc4ODcxNSwiYXVkIjoibmV4LWNybSIsInN1YiI6InRlc3QiLCJ' +
  '1c2VybmFtZSI6InRlc3QiLCJmaXJzdE5hbWUiOiJUZXN0IiwibGFzdE5hbWUiOiJVc2VyIn0.ZF1SEv7AV5GL23F-88' +
  'YRnu52yMFGWzWobQgaWuvhCPw';

const defaultUser = new User(stdUser);

export function fakeBackendFactory(backend: MockBackend,
                                   options: BaseRequestOptions,
                                   realBackend: XHRBackend) {
  // array in local storage for registered users
  const users: any[] = JSON.parse(localStorage.getItem('users')) || [defaultUser];

  // configure fake backend
  backend.connections.subscribe((connection: MockConnection) => {
    // wrap in timeout to simulate server api call
    const isGetRequest = connection.request.method === RequestMethod.Get;
    const isPostRequest = connection.request.method === RequestMethod.Post;
    const isDeleteRequest = connection.request.method === RequestMethod.Delete;

    setTimeout(() => {

      // authenticate
      if (connection.request.url.endsWith(backendRoutes.auth) && isPostRequest) {
        // get parameters from post request
        const params = JSON.parse(connection.request.getBody());

        // find if any user matches login credentials
        const filteredUsers = users.filter((user: User) => {
          return user.username === params.username && user.password === params.password;
        });

        if (filteredUsers.length) {
          // if login details are valid return 200 OK with user details and fake jwt token
          const user = filteredUsers[0];
          connection.mockRespond(new Response(new ResponseOptions({
            status: 200,
            body: {
              code: 'success',
              data: {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                authToken: user.authToken
              }
            }
          })));
        } else {
          // else return 400 bad request
          connection.mockError(new Error('Username or password is incorrect'));
        }

        return;
      }

      // get users
      if (connection.request.url.endsWith('/api/users') && isGetRequest) {
        if (connection.request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
          connection.mockRespond(new Response(new ResponseOptions({status: 200, body: users})));
        } else {
          // return 401 not authorised if token is null or invalid
          connection.mockRespond(new Response(new ResponseOptions({status: 401})));
        }

        return;
      }

      // get user by id
      if (connection.request.url.match(/\/api\/users\/\d+$/) && isGetRequest) {
        if (connection.request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
          // find user by id in users array
          const urlParts = connection.request.url.split('/');
          const id = urlParts[urlParts.length - 1];
          const matchedUsers = users.filter((checkedUser: User) => {
            return checkedUser.id === id;
          });
          const user = matchedUsers.length ? matchedUsers[0] : null;

          // respond 200 OK with user
          connection.mockRespond(new Response(new ResponseOptions({status: 200, body: user})));
        } else {
          // return 401 not authorised if token is null or invalid
          connection.mockRespond(new Response(new ResponseOptions({status: 401})));
        }

        return;
      }

      // create user
      if (connection.request.url.endsWith('/api/users') && isPostRequest) {
        // get new user object from post body
        const newUser = JSON.parse(connection.request.getBody());

        // validation
        const duplicateUser = users.filter((user) => {
          return user.username === newUser.username;
        }).length;
        if (duplicateUser) {
          return connection.mockError(
            new Error('Username "' + newUser.username + '" is already taken')
          );
        }

        // save new user
        newUser.id = users.length + 1;
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // respond 200 OK
        connection.mockRespond(new Response(new ResponseOptions({status: 200})));

        return;
      }

      // delete user
      if (connection.request.url.match(/\/api\/users\/\d+$/) && isDeleteRequest) {
        if (connection.request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
          // find user by id in users array
          const urlParts = connection.request.url.split('/');
          const id = urlParts[urlParts.length - 1];
          for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user.id === id) {
              // delete user
              users.splice(i, 1);
              localStorage.setItem('users', JSON.stringify(users));
              break;
            }
          }

          // respond 200 OK
          connection.mockRespond(new Response(new ResponseOptions({status: 200})));
        } else {
          // return 401 not authorised if token is null or invalid
          connection.mockRespond(new Response(new ResponseOptions({status: 401})));
        }

        return;
      }

      // pass through any requests not handled above
      const realHttp = new Http(realBackend, options);
      const requestOptions = new RequestOptions({
        method: connection.request.method,
        headers: connection.request.headers,
        body: connection.request.getBody(),
        url: connection.request.url,
        withCredentials: connection.request.withCredentials,
        responseType: connection.request.responseType
      });
      realHttp.request(connection.request.url, requestOptions)
        .subscribe((response: Response) => {
            connection.mockRespond(response);
          },
          (error: any) => {
            connection.mockError(error);
          });

    }, 500);

  });

  return new Http(backend, options);
}

export let fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: Http,
  useFactory: fakeBackendFactory,
  deps: [MockBackend, BaseRequestOptions, XHRBackend]
};
