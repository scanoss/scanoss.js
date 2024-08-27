import FormData from 'form-data';

export abstract class Transport<T1> {

  abstract get(url: string): Promise<T1>;

  abstract post(url: string, body: FormData): Promise<T1>;

  abstract put(url: string, body: FormData): Promise<T1>;

  abstract delete(url: string): Promise<T1>;

}
