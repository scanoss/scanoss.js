export abstract class Transport<T1> {

  abstract get(url: string): Promise<T1>;

}
