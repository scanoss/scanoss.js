
export class IJob<T> {
    getData:() => T;
}

export class Job<T> implements IJob<T> {
    data: T;
    constructor(data: T) {
        this.data = data;
    }
    public getData(): T{
        return this.data;
    };
}