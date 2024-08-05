import { expect } from 'chai';
import { DataNode, ProcessNode } from '@process-code/core';
import { map, debounceTime, switchMap, Observable, tap, BehaviorSubject, filter, OperatorFunction } from 'rxjs';

describe('node test', () => {
    it('simple use', (done) => {
        const sourceData = [{
            name: '测试1',
            id: '1',
            address: '地址',
            link: 'https://bing.com',
            isActive: false,
            customerNum: 51
        }, {
            name: '测试2',
            id: '2',
            address: '地址',
            link: 'https://bing.com',
            isActive: true,
            customerNum: 101
        }];
        const targetData = [{
            name: '测试1',
            id: '1',
            address: '地址',
            link: 'https://bing.com',
            isActive: false,
            customerNum: 51,
            isMore: false
        }, {
            name: '测试2',
            id: '2',
            address: '地址',
            link: 'https://bing.com',
            isActive: true,
            customerNum: 101,
            isMore: true
        }];
        type TableItem = { name: string, id: string, address: string, link: string, isActive: boolean, customerNum: number };
        type TableItem2 = TableItem & { isMore: boolean };
        const listNode = new DataNode<TableItem[]>();
        const t1 = new ProcessNode<TableItem[], TableItem2[]>(map((list) => {
            return list.map(item => {
                return {
                    ...item,
                    isMore: item.customerNum > 100
                }
            })
        }));
        t1.setInputNode(listNode);
        const loadingNode = new DataNode<boolean>(false);
        // 点击事件流
        const clickEventNode = new DataNode<MouseEvent>();
        // 防连点
        const ce1 = new ProcessNode<MouseEvent, MouseEvent>(debounceTime(300));
        ce1.setInputNode(clickEventNode);
        // loading状态不继续触发后续
        const ce4 = new ProcessNode<MouseEvent, MouseEvent>(filter((value) => ((loadingNode.getObservable() as BehaviorSubject<boolean>).value === false)));
        ce4.setInputNode(ce1);
        type SearchForm = {name?: string, id?: string, pageNum: number, pageSize: 10};
        // 构建参数
        // const d3 = new DataNode<{name?: string, id?: string}>({});
        // d3.setInputNode();
        // const ce3 = new ProcessNode<MouseEvent, SearchForm>(map((e) => {
        //     return {
        //         name: '123',
        //         id: '1'
        //     }
        // }));
        // ce3.setInputNode(ce4);
        const initSearchForm: SearchForm = {
            pageNum: 1,
            pageSize: 10
        };
        const searchData = new DataNode<SearchForm>(initSearchForm);
        const usingSearchData = new DataNode<SearchForm>(initSearchForm);
        ce4.getObservable().subscribe((value) => {
            usingSearchData.setData(searchData.getData());
        });

        // 请求数据
        const ce2 = new ProcessNode<SearchForm, TableItem[]>(switchMap((e) => {
            // do something
            return new Observable<TableItem[]>((subscriber) => {
                const timeoutId = setTimeout(() => {
                    subscriber.next(sourceData);
                    subscriber.complete();
                }, 1000)
                return () => {
                    clearTimeout(timeoutId)
                }
            }).pipe(tap({
                subscribe: () => {
                    // console.log('subscribe')
                    loadingNode.setData(true)
                },
                unsubscribe: () => {
                    // console.log('unsubscribe')
                    loadingNode.setData(false)
                },
                complete: () => {
                    // console.log('complete')
                    loadingNode.setData(false)
                }
            }))
        }));
        ce2.setInputNode(usingSearchData);
        // 更新数据
        ce2.getObservable().subscribe((value) => {
            listNode.setData(value);
        })
        // 判定数据已更新
        t1.getObservable().subscribe((value) => {
            try {
                expect(value).to.deep.equal(targetData)
                process.nextTick(() => {
                    expect((loadingNode.getObservable() as BehaviorSubject<boolean>).value).to.equal(false)
                    done()
                })
            } catch (e) {
                // console.error(e)
                done(e)
            }
        })
        // 触发点击事件
        clickEventNode.setData({} as any)
        setTimeout(() => {
            clickEventNode.setData({} as any)
        }, 100)
        setTimeout(() => {
            clickEventNode.setData({} as any)
        }, 500)
    })

    it('branch test', (done) => {
        type Data1 = { name: string, age: number };
        const dataNode = new DataNode<Data1>();
        const pNode1 = new ProcessNode<Data1, Data1>(filter(value => value.age > 18));
        const pNode2 = new ProcessNode<Data1, Data1>(filter(value => value.age <= 18));
        dataNode.setOutputNode(pNode1, pNode2)
        pNode1.getObservable().subscribe((value) => {
            done('不应该走到这个分支')
        })
        pNode2.getObservable().subscribe((value) => {
            done()
        })
        dataNode.setData({
            name: '美少女',
            age: 18
        })
    })

    it('branch test2', (done) => {
        type Data1 = { name: string, age: number };
        const dataNode = new DataNode<Data1>();
        const pNode1 = new ProcessNode<Data1, Data1>(filter(value => value.age > 18));
        const pNode2 = new ProcessNode<Data1, Data1>(filter(value => value.age <= 18));
        dataNode.setOutputNode(pNode1, pNode2)
        pNode1.getObservable().subscribe((value) => {
            done()
        })
        pNode2.getObservable().subscribe((value) => {
            done('不应该走到这个分支')
        })
        dataNode.setData({
            name: '老阿姨',
            age: 20
        })
    })

    it('merge test', (done) => {
        type Data1 = { name: string, age: number };
        const dataNode = new DataNode<Data1>();
        const pNode1 = new ProcessNode<Data1, Data1>(filter(value => value.age > 18));
        const pNode2 = new ProcessNode<Data1, Data1>(filter(value => value.age <= 18));
        dataNode.setOutputNode(pNode2, pNode1);
        pNode1.getObservable().subscribe((value) => {
            console.log('pnode1', value);
        });
        pNode2.getObservable().subscribe((value) => {
            console.log('pnode2', value);
            done('way is wrong');
        });
        const mergeNode = new ProcessNode<Data1, Data1>(map(value => {
            // 存在副作用的写法会带来bug
            // value.age = 18;
            // return value;
            return {
                ...value,
                age: 18
            };
        }));
        mergeNode.setInputNode(pNode1, pNode2);
        mergeNode.getObservable().subscribe((value) => {
            console.log(value);
            expect(value.age).to.equal(18);
            done();
        });
        dataNode.setData({
            name: '大龄美少女',
            age: 19
        });
    })

    it('master function use', (done) => {
        const sourceData = [{
            name: '测试1',
            id: '1',
            address: '地址',
            link: 'https://bing.com',
            isActive: false,
            customerNum: 51
        }, {
            name: '测试2',
            id: '2',
            address: '地址',
            link: 'https://bing.com',
            isActive: true,
            customerNum: 101
        }];
        const targetData = [{
            name: '测试1',
            id: '1',
            address: '地址',
            link: 'https://bing.com',
            isActive: false,
            customerNum: 51,
            isMore: false
        }, {
            name: '测试2',
            id: '2',
            address: '地址',
            link: 'https://bing.com',
            isActive: true,
            customerNum: 101,
            isMore: true
        }];
        type TableItem = { name: string, id: string, address: string, link: string, isActive: boolean, customerNum: number };
        type TableItem2 = TableItem & { isMore: boolean };
        type SearchForm = {name: string, id: string};

        function test<D1, D2, D3, P1O, P2O, P3O, P4O>(args: {
            process: {
                p1: OperatorFunction<D1, P1O>,
                p2: OperatorFunction<D3, P2O>,
                p3: OperatorFunction<P2O, P3O>,
                p4: OperatorFunction<P3O, P4O>,
                p5: OperatorFunction<P4O, D1>,
            },
            initValue: {
                d1?: D1,
                d2?: D2,
                d3?: D3,
            }
        }) {
            const d1 = new DataNode<D1>(args.initValue.d1);
            const d2 = new DataNode<D2>(args.initValue.d2);
            const d3 = new DataNode<D3>(args.initValue.d3);

            const p1 = new ProcessNode<D1, P1O>(args.process.p1);
            const p2 = new ProcessNode<D3, P2O>(args.process.p2);
            const p3 = new ProcessNode<P2O, P3O>(args.process.p3);
            const p4 = new ProcessNode<P3O, P4O>(args.process.p4);
            const p5 = new ProcessNode<P4O, D1>(args.process.p5);

            const nodes = {
                d1,
                d2,
                d3,
                p1,
                p2,
                p3,
                p4,
                p5
            };
            p1.setInputNode(d1);
            // 防连点
            p2.setInputNode(d3);
            // loading状态不继续触发后续
            p3.setInputNode(p2);
            // 构建参数
            p4.setInputNode(p3);
            // 请求数据
            p5.setInputNode(p4);
            // 更新数据
            d1.setInputNode(p5);

            return nodes;
        }

        /**
         * node互相操作的情况下应该如何处理？
         * 
         */

        done();
    })
})
