# part2

## 前言

上节课使用了string类型的变量，值得注意的是，在智能合约中使用string后需要加上memory，也就意味着使用string需要损耗一定的内存资源，与之对应的就是gas费的提高。因此在编写智能合约中，应尽可能较少的使用string从而减少gas费，多使用bool，integer，address等类型







## 类型

solidity是一种静态类型的语言，这意味着需要指定每个变量（state和local）的类型。solidity提供了几个基本类型，可以组合成复杂的类型。



## 价值类型

以下类型也称为值类型，因为这些类型的变量总是按值传递的，即当它们用作函数参数或在赋值中使用时，它们总是被复制的。



### 布尔值

`bool` ：可能的值是常量 `true` 和 `false` .

操作员：

- `!` （逻辑否定）
- `&&` （逻辑连接，“and”）
- `||` （逻辑分离，“或”）
- `==` （相等）
- `!=` （不d等）

运营商 `||` 和 `&&` 应用常见的短路规则。这意味着在表达式中 `f(x) || g(y)` 如果 `f(x)` 评估为 `true` ， `g(y)` 即使有副作用也不会被评估。



### 整数

`int` / `uint` ：各种大小的有符号和无符号整数。关键词 `uint8` 到 `uint256` 步骤 `8` （8到256位的无符号）和 `int8` 到 `int256` . `uint` 和 `int` 是别名 `uint256` 和 `int256` ，分别。

操作员：

- 比较： `<=` ， `<` ， `==` ， `!=` ， `>=` ， `>` （评估为 `bool` ）
- 位运算符： `&` ， `|` ， `^` （位异或）， `~` （位否定）
- 轮班操作员： `<<` （左移） `>>` （右移位）
- 算术运算符： `+`, `-`, unary `-` (only for signed integers), `*`, `/`, `` %``(模数)， `**` (求幂)

对于整数类型 `X` ，你可以使用 `type(X).min` 和 `type(X).max` 访问由类型表示的最小值和最大值。



#### 比较

比较值是通过比较整数值得到的值。

#### 位操作

位操作是在数字的两个补码表示上执行的。例如，这意味着 `~int256(0) == int256(-1)` .

#### 移位

移位运算的结果具有左操作数的类型，并截断结果以匹配该类型。右操作数必须是无符号类型，尝试按有符号类型移位将产生编译错误。

可以通过以下方式使用2的幂的乘法来“模拟”移位。请注意，对左操作数类型的截断始终在末尾执行，但没有明确提到。

- `x << y` 等同于数学表达式 `x * 2**y` 。
- `x >> y` 等同于数学表达式 `x / 2**y` ，四舍五入为负无穷大。



#### 加、减、乘

加法、减法和乘法具有通常的语义，对于上溢和下溢有两种不同的模式：

默认情况下，会检查所有算术是否存在不足或溢出，但可以使用 [unchecked block](https://www.osgeo.cn/solidity/control-structures.html#unchecked) ，从而产生包装算法。更多细节可以在那一节找到。

表达式 `-x` 相当于 `(T(0) - x)` 哪里 `T` 是类型为 `x` 。它只能应用于带符号的类型。的价值 `-x` 如果满足以下条件，则可以为正 `x` 是阴性的。从二的补码表示还可以得出另一个警告：

如果你有 `int x = type(int).min;` ，那么 `-x` 不符合正值范围。这意味着 `unchecked {{ assert(-x == x); }}` 作品，并且表达式 `-x` 在选中模式下使用时，将导致断言失败。

#### 除法

由于运算结果的类型始终是其中一个操作数的类型，因此对整数进行除法始终会产生整数。在稳固中，除法向零四舍五入。这意味着 `int256(-5) / int256(2) == int256(-2)` 。

注意，与此相反，除法 [literals](https://www.osgeo.cn/solidity/types.html#rational-literals) 产生任意精度的分数值。



#### 模

模运算 `a % n` 生成余数 `r` 操作数除后 `a` 按操作数 `n` 在哪里 `q = int(a / n)` 和 `r = a - (n * q)` .这意味着模的结果与其左操作数（或零）相同，并且 `a % n == -(-a % n)` 保留为负数 `a` ：

- `int256(5) % int256(2) == int256(1)`
- `int256(5) % int256(-2) == int256(1)`
- `int256(-5) % int256(2) == int256(-1)`
- `int256(-5) % int256(-2) == int256(-1)`



#### 求幂

求幂仅适用于指数中的无符号类型。求幂的结果类型始终等于基数的类型。请注意其大小足以容纳结果，并为潜在的断言失败或包装行为做好准备。

注解

在选中模式下，求幂仅使用相对便宜的 `exp` 用于小型基地的操作码。对于以下情况： `x**3` ，该表达式 `x*x*x` 可能会更便宜。在任何情况下，汽油成本测试和优化器的使用都是可取的。







### 定点数

警告

固数还不完全支持定点数。它们可以声明，但不能分配给或来自。

`fixed` / `ufixed` ：各种尺寸的有符号和无符号固定点号。关键词 `ufixedMxN` 和 `fixedMxN` 在哪里 `M` 表示类型和 `N` 表示有多少个小数点可用。 `M` 必须能被8整除，从8位到256位。 `N` 必须介于0和80之间（含0和80）。 `ufixed` 和 `fixed` 是别名 `ufixed128x18` 和 `fixed128x18` ，分别。

操作符：

- 比较： `<=` ， `<` ， `==` ， `!=` ， `>=` ， `>` （评估为 `bool` ）
- 算术运算符： `+`, `-`, unary `-`, `*`, `/`, `` %``（模块）



### 地址

地址类型有两种风格，基本相同：

- `address` ：保留一个20字节的值（以太坊地址的大小）。
- `address payable` 一样 `address` 但是有了额外的成员 `transfer` 和 `send` .

这种区别背后的想法是 `address payable` 是一个地址，你可以发送到 Ether ，而平原 `address` 不能用 Ether 发送。

类型转换：

隐式转换自 `address payable` 到 `address` 允许，而转换自 `address` 到 `address payable` 必须通过显式 `payable(<address>)` .

显式来回转换 `address` 是允许的 `uint160` ，整数字面值， `bytes20` 和合同类型。

仅类型的表达式 `address` 可以将合同型转换为合同型 `address payable` 通过显式转换 `payable(...)` 。对于合同类型，仅当合同可以接收以太时才允许此转换，即合同具有 [receive](https://www.osgeo.cn/solidity/contracts.html#receive-ether-function) 或付费后备功能。请注意， `payable(0)` 是有效的，并且是此规则的例外。







# 编写MyTypes智能合约

### 布尔(bool)

bool类型默认为false值

bool类型值只能赋值true或者false



### 整数(Integers)

**int** / **uint**  分别是有符号和无符号整数，他们具有可变的内存体积。关键字uint8到uint256与int8到uint8相对应。数字后缀代表的是变量的内存大小，uint8指的是**8bits**的无符号整数。并且uint与int是uint256与int256的别名(alias)。

uint256能存储更大的整数，这就是为什么uint256类型经常被用来做地址，用户余额，或者nft数量的映射. 但是较大的字节存储意味着需要付更多的gas费，即便gas费是驱动矿工挖矿的主要动力, 我们也要尽可能在不必要的情况下使用占用更少存储空间的类型减少gas费从而减少成本，也就是uint32，uint16, uint8。 



> 特别提及uint8只能存储8比特，因此使用uint8类型的变量范围应在0-255之间
>
> 2 ** 8 -1 = 255



如上文所提及uint是无符号整数，即unsigned integer，所以不能带负号 而int类型整数可以赋值为负数



## 地址(address)

地址类型是较为特殊的变量类型，这中变量对应一个合约或者账户(本质上合约就是一个账户)，他主要包含两种风格：

> address: 包含20byte的值 （以太坊地址） address payable: 与address一样，但是包含transfer和send两个成员

两者的主要区别是，后者可以就收以太币(Ether)，但是address却不能，这里一定要注意，尤其是在写攻击合约的时候。

address payable 到 address的隐式转换是允许的，但是反过来却不行，地址字面量能够被隐式的转换为address payable

```solidity
// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.0;

contract MyContract {
    bool myBoolean;
    uint256 myUint;
    uint32 myUint32;
    uint16 myUint16;

    int256 myUint2 = -234234;

    address myAddress = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db;
}
```



## 变量可见性(scope)

在创建了上文的这些变量后部署合约，并不能看到这些变量，是因为这些变量默认为private(而前文的字符串可以获取是因为设置了public)

一共有三种范围:

- public
- internal
- private
- external

直接在合约内部声明的变量称为合约变量，合约内部和合约里的方法可以直接获取这些变量

#### public

声明变量时，再其变量类型后加上 public 如：uint256 public myUint; 在合约部署后, 该变量就可以被所有调用该合约的用户所读取

#### private

申明变量时默认为private范围，private范围使得变量只能在当前合约被调用或读写, 就算是其他的合约也调用不到

#### internal

internal类型的**状态变量**可供**外部**和**子合约**调用。

internal类型的**函数**和private类型的函数一样，智能合约自己内部调用，它和其他语言中的protected不完全一样。



#### external

不能从内部访问，只能从外部访问



# public和external的区别

```solidity
pragma solidity^0.8.0;

contract Test {
    function test(uint[20] a) public returns (uint){
         return a[10]*2;
    }

    function test2(uint[20] a) external returns (uint){
         return a[10]*2;
    }
}
```

调用每个函数，我们可以看到public函数使用496 gas，而external函数只使用261 gas。

区别在于，在public函数中，solididity会立即将数组参数复制到内存中，而external函数可以直接从calldata中读取参数。内存分配非常昂贵，而从calldata读取内存则很便宜。

public函数需要将所有参数写入内存的原因是，public函数可以在内部调用，这实际上是一个与external调用完全不同的过程。internal调用通过代码中的跳转来执行，数组参数通过指向内存的指针在内部传递。因此，当编译器为internal函数生成代码时，该函数希望其参数位于内存中。

对于external函数，编译器不需要允许内部调用，因此它允许直接从calldata读取参数，省去了复制步骤。

如果您希望只在外部调用函数，则应该使用external，如果需要在内部调用函数，则使用public。

只要在外部调用一个函数，并传入大量的calldata(例如，大型数组)，就可以从本质上看到外部的性能优势。





## View函数

可以将函数声明为 `view` 类型，这种情况下要保证不修改状态。

下面的语句被认为是修改状态：

1. 修改状态变量。

2. [产生事件](https://solidity-cn.readthedocs.io/zh/develop/contracts.html?highlight=view#events)。

3. [创建其它合约](https://solidity-cn.readthedocs.io/zh/develop/control-structures.html#creating-contracts)。

4. 使用 `selfdestruct`。

5. 通过调用发送以太币。

6. 调用任何没有标记为 `view` 或者 `pure` 的函数。

7. 使用低级调用。

8. 使用包含特定操作码的内联汇编。

   ```solidity
   pragma solidity ^0.8.0;
   
   contract C {
       function f(uint a, uint b) public view returns (uint) {
           return a * (b + 42) + now;
       }
   }
   ```



## Pure函数

函数可以声明为 pure ，在这种情况下，承诺不读取或修改状态。

除了上面解释的状态修改语句列表之外，以下被认为是从状态中读取：

- 读取状态变量。
- 访问 this.balance 或者 <address>.balance。
- 访问 block，tx， msg 中任意成员 （除 msg.sig 和 msg.data 之外）。
- 调用任何未标记为 pure 的函数。
- 使用包含某些操作码的内联汇编。



```solidity
pragma solidity ^0.8.0;

contract C {
    function f(uint a, uint b) public pure returns (uint) {
        return a * (b + 42);
    }
}
```





## Constant 状态变量

状态变量可以被声明为 constant。在这种情况下，只能使用那些在编译时有确定值的表达式来给它们赋值。 任何通过访问 storage，区块链数据（例如 now, this.balance 或者 block.number）或执行数据（ msg.gas ） 或对外部合约的调用来给它们赋值都是不允许的。 在内存分配上有边界效应（side-effect）的表达式是允许的，但对其他内存对象产生边界效应的表达式则不行。 内建（built-in）函数 keccak256，sha256，ripemd160，ecrecover，addmod 和 mulmod 是允许的（即使他们确实会调用外部合约）。

允许带有边界效应的内存分配器的原因是这将允许构建复杂的对象，比如查找表（lookup-table）。 此功能尚未完全可用。

编译器不会为这些变量预留存储，它们的每次出现都会被替换为相应的常量表达式（这将可能被优化器计算为实际的某个值）。

不是所有类型的状态变量都支持用 constant 来修饰，当前支持的仅有值类型和字符串。



```solidity
pragma solidity ^0.8.0;

contract C {
    uint constant x = 32**22 + 8;
    string constant text = "abc";
    bytes32 constant myHash = keccak256("abc");
}
```





在Solidity中constant，view，pure三个函数修饰词的作用是告诉编译器，函数不改变/不读取状态变量，这样函数执行就可以不消耗gas了（是完全不消耗！），因为不需要矿工来验证。
 在Solidity v4.17之前，只有constant，后来有人嫌constant这个词本身代表变量中的常量，不适合用来修饰函数，所以将constant拆成了view和pure。
 view的作用和constant一模一样，可以读取状态变量但是不能改；
 pure则更为严格，pure修饰的函数不能改也不能读状态变量，否则编译通不过。

