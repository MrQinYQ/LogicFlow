import { merge, Observable, OperatorFunction, Subject, Subscription } from "rxjs";
import { StateSubject, StateSubjectClass } from './subject';

export interface INode<I, O> {
    getObservable: () => Observable<O>;
    setInputNode: (...nodes: INode<any, I>[]) => void;
    setOutputNode: (...nodes: INode<O, any>[]) => void;
    removeInputNode: () => void;
}

export abstract class AbstractNode<I, O> implements INode<I, O> {
    protected abstract process(inputObservable: Observable<I>): Observable<O>;
    protected observable?: Observable<O>;
    protected subscription?: Subscription;
    getObservable() {
        if (!this.observable) {
            throw new Error('observable is not init')
        }
        return this.observable
    }
    setInputNode(...nodes: INode<any, I>[]) {
        if (!nodes.length) {
            throw new Error('input nodes is empty');
        }
        this.removeInputNode();
        const inputObservable: Observable<I> = merge(...nodes.map(item => item.getObservable()))
        this.observable = this.process(inputObservable)
    }
    setOutputNode(...nodes: INode<O, any>[]) {
        if (!this.observable) {
            throw new Error('observable is not init')
        }
        if (!nodes.length) {
            throw new Error('output nodes is empty');
        }
        for (const node of nodes) {
            node.setInputNode(this)
        }
    }
    removeInputNode() {
        this.subscription?.unsubscribe();
    }
}

export class DataNodeClass<T, V = T | undefined> extends AbstractNode<T, T> {
    protected observable: Observable<T>;
    constructor(initData?: T) {
        super();
        this.observable = new StateSubject<T>(initData);
    }
    protected process(inputObservable: Observable<T>): Observable<T> {
        this.subscription = inputObservable.subscribe(this.observable as StateSubjectClass<T>);
        return this.observable;
    }
    setData(data: T) {
        (this.observable as StateSubjectClass<T>).next(data);
    }
    getData(): V {
        return (this.observable as StateSubjectClass<T>).getValue() as V;
    }
}

interface DataNodeConstructor {
    new <T>(): DataNodeClass<T, T | undefined>;
    new <T>(value: T): DataNodeClass<T, T>;
    new <T>(value: undefined): DataNodeClass<T, T | undefined>;
    new <T>(value?: T): DataNodeClass<T, T | undefined>;
}

export const DataNode: DataNodeConstructor = DataNodeClass;

export class DataProcessNodeClass<I, O, V = O> extends AbstractNode<I, O> {
    protected observable: Observable<O>;
    protected process(inputObservable: Observable<I>): Observable<O> {
        this.subscription = this.processFn(inputObservable).subscribe(this.observable as StateSubjectClass<O>)
        return this.observable;
    }
    constructor(private processFn: OperatorFunction<I, O>, initData?: O) {
        super();
        this.observable = new StateSubject<O>(initData);
    }
    setData(data: O) {
        (this.observable as StateSubjectClass<O>).next(data);
    }
    getData(): V {
        return (this.observable as StateSubjectClass<O>).getValue() as V;
    }
}

interface DataProcessNodeConstructor {
    new <I, O>(processFn: OperatorFunction<I, O>): DataProcessNodeClass<I, O, O | undefined>;
    new <I, O>(processFn: OperatorFunction<I, O>, value: O): DataProcessNodeClass<I, O, O>;
    new <I, O>(processFn: OperatorFunction<I, O>, value: undefined): DataProcessNodeClass<I, O, O | undefined>;
    new <I, O>(processFn: OperatorFunction<I, O>, value?: O): DataProcessNodeClass<I, O, O | undefined>;
}

export const DataProcessNode: DataProcessNodeConstructor = DataProcessNodeClass;

export class ProcessNode<I, O> extends AbstractNode<I, O> {
    protected process(inputObservable: Observable<I>): Observable<O> {
        return this.processFn(inputObservable);
    }
    constructor(private processFn: OperatorFunction<I, O>) {
        super();
    }
}
