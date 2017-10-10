import { Http, RequestOptions, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';

const apiPrefix = '/api/v1/';

export const backendRoutes = {
    auth: apiPrefix + 'authenticate'
};

enum RequestMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}

@Injectable()
export class HttpService {
    public constructor(private http: Http) {
    }

    public get(url, options?): Observable<Response> {
        return this.request(RequestMethod.GET, url, undefined, options);
    }

    public post(url, body, options?): Observable<Response> {
        return this.request(RequestMethod.POST, url, body, options);
    }

    private request(type: RequestMethod, url: string, body?: any, options?: RequestOptions): Observable<Response> {
        HttpService.logRequest(type, url, body);
        switch (type) {
            case RequestMethod.GET:
                return this.http.get(url, options);
            case RequestMethod.POST:
                return this.http.post(url, body, options);
            default:
                throw Error('Not implemented http method');
        }
    }

    private static logRequest(type: RequestMethod, url: string, body?: any) {
        console.group(`${type}: ${url}`);
        console.log('Url:', url);
        console.log('Body:', body);
        console.groupEnd();
    }
}
