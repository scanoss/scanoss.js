import FormData from 'form-data';

export abstract class Transport<T1> {

  protected abstract get(url: string): Promise<T1>;

  protected abstract post(url: string, body: FormData): Promise<T1>;

  protected abstract put(url: string, body: FormData): Promise<T1>;

  protected abstract delete(url: string): Promise<T1>;

}
