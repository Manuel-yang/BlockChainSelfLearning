# Solidity：require()、assert()、revert()区别到底在哪？

## 💎Example

如下三行是与`if(msg.sender != owner) { throw; }`的效果是等价的。

```solidity
if(msg.sender != owner) { revert(); } 

assert(msg.sender == owner);
 
require(msg.sender == owner);
```

下面具体说说这三个函数的区别。

## 💎Require()使用场景

1. 验证用户输入，即： `require(input<20);`
2. 验证外部合约响应，即： `require(external.send(amount));`
3. 执行合约前，验证状态条件，即： `require(block.number > SOME_BLOCK_NUMBER)` 或者 `require(balance[msg.sender]>=amount)`
4. require应该被**最常使用**到；一般用于函数的**开头处**。

## 💎Assert()使用场景

1. 检查 overflow/underflow，

   例：`c = a+b; assert(c > b);`

2. 检查非变量（invariants），

   例：`assert(this.balance >= totalSupply);`

3. 验证改变后的状态，不应该发生的条件

4. 一般地，**尽量少使用** assert 调用，如要使用assert 应该在**函数结尾处**使用

5. 基本上，`require()` 应该被用于函数中检查条件，`assert()` 用于预防不应该发生的情况，但不应该使条件错误。

6. 另外，“除非认为之前的检查（用 if 或 require ）会导致无法验证 overflow，否则不应该盲目使用 assert 来检查 overflow”

## ⭐Require对比Assert，为什么Assert用的少？

### Gas消耗

同样作为判断一个条件是否满足的函数，require会退回剩下的gas，而assert会烧掉所有的gas。

### 报错分析

require()语句的失败报错应该被看作一个正常的判断语句流程不通过的事件；

而assert()语句的失败报错，意味着发生了代码层面的错误事件，很大可能是合约中有一个bug需要修复。



## 💎Revert()特点

1. 允许你返回一个值；

   例：`revert(‘Something bad happened’);`等价于`require(condition, ‘Something bad happened’);`

2. 它会把所有剩下的gas退回给caller

   

## ⭐Require对比Revert，复杂时候用Revert

## Gas消耗

两者一样都会向剩余的gas费返还给调用者

## 使用差异

revert()处理与 require() 同样的类型，但是需要更复杂处理逻辑的场景

如果有复杂的 if/else 逻辑流，那么应该考虑使用 revert() 函数而不是require()。记住，复杂逻辑意味着更多的代码。
