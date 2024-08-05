import { Subject, Subscriber, Subscription } from 'rxjs';

export class StateSubjectClass<T, V = T | undefined> extends Subject<T> {

    constructor(private _value?: T) {
        super();
    }
  
    get value(): V {
        return this.getValue();
    }
  
    /** @internal */
    protected _subscribe(subscriber: Subscriber<T>): Subscription {
        // @ts-ignore
        const subscription = super._subscribe(subscriber);
        !subscription.closed && this._value && subscriber.next(this._value);
        return subscription;
    }
  
    getValue(): V {
        const { hasError, thrownError, _value } = this;
        if (hasError) {
            throw thrownError;
        }
        // @ts-ignore
        this._throwIfClosed();
        return _value as V;
    }
  
    next(value: T): void {
        super.next((this._value = value));
    }
}

interface StateSubjectConstructor {
    new <T>(): StateSubjectClass<T, T | undefined>;
    new <T>(value: T): StateSubjectClass<T, T>;
    new <T>(value: undefined): StateSubjectClass<T, T | undefined>;
    new <T>(value?: T): StateSubjectClass<T, T | undefined>;
}

export const StateSubject: StateSubjectConstructor = StateSubjectClass;
