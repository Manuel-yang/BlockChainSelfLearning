# part3

### 类型转换

#### 显式转换

在声明address类型的同时也声明了payable，通过此声明允许该地址进行交易

```solidity
uint256 test = uint256(235235);

address payable myAddress = payable(0x5B38Da6a701c568545dCfcB03FcB875f56beddC4);

myAddress.transfer(xxx);
```





## 关键词This

地址中填this指向当前合约地址

从而获取合约中的余额

```solidity
address contractAddress = address(this);
uint256 balanceOfContract = contractAddress.balance;
```





# 编写MyVariables合约

创建一个名为MyVariables.sol的合约文件

Solidity 支持三种类型的变量：

- 状态变量 – 变量值永久保存在合约存储空间中的变量。
- 局部变量 – 变量值仅在函数执行过程中有效的变量，函数退出后，变量无效。
- 全局变量 – 保存在全局命名空间，用于获取区块链相关信息的特殊变量。

Solidity 是一种静态类型语言，这意味着需要在声明期间指定变量类型。每个变量声明时，都有一个基于其类型的默认值。没有 **undefined**或 **null**的概念。

## 状态变量

变量值永久保存在合约存储空间中的变量。以太坊虚拟机可以更新或者改变状态变量

```solidity
pragma solidity ^0.8.0;
contract SolidityTest {
  uint storedData; // 状态变量
  constructor() public {
   storedData = 10; // 使用状态变量
  }
}
```



我们一般通过function来改变储存在区块链上的状态变量





## 局部变量

变量值仅在函数执行过程中有效的变量，函数退出后，变量无效。函数参数是局部变量。

```solidity
pragma solidity ^0.8.0;
contract SolidityTest {
  uint storedData; // 状态变量
  constructor() public {
   storedData = 10;
  }
  function getResult() public view returns(uint){
   uint a = 1; // 局部变量
   uint b = 2;
   uint result = a + b;
   return result; // 访问局部变量
  }
}


pragma solidity ^0.8.0;
contract SolidityTest {
  uint storedData; // 状态变量
  constructor() public {
   storedData = 10;
  }
  function getResult() public view returns(uint){
   uint a = 1; // 局部变量
   uint b = 2;
   uint result = a + b;
   return storedData; // 访问状态变量
  }
}
```

可以使用Solidity – 第一个程序中的步骤，运行上述程序。

输出

```solidity
0: uint256: 10
```



## 全局变量

这些是全局工作区中存在的特殊变量，提供有关区块链和交易属性的信息。

| 名称                                          | 返回                                                     |
| --------------------------------------------- | -------------------------------------------------------- |
| blockhash(uint blockNumber) returns (bytes32) | 给定区块的哈希值 – 只适用于256最近区块, 不包含当前区块。 |
| block.coinbase (address payable)              | 当前区块矿工的地址                                       |
| block.difficulty (uint)                       | 当前区块的难度                                           |
| block.gaslimit (uint)                         | 当前区块的gaslimit                                       |
| block.number (uint)                           | 当前区块的number                                         |
| block.timestamp (uint)                        | 当前区块的时间戳，为unix纪元以来的秒                     |
| gasleft() returns (uint256)                   | 剩余 gas                                                 |
| msg.data (bytes calldata)                     | 完成 calldata                                            |
| msg.sender (address payable)                  | 消息发送者 (当前 caller)                                 |
| msg.sig (bytes4)                              | calldata的前四个字节 (function identifier)               |
| msg.value (uint)                              | 当前消息的wei值                                          |
| now (uint)                                    | 当前块的时间戳                                           |
| tx.gasprice (uint)                            | 交易的gas价格                                            |
| tx.origin (address payable)                   | 交易的发送方                                             |

获取区块链上的时间戳

```solidity
// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.0;

contract MyVariables {
    uint256 time = block.timestamp;
}
```





## Solidity变量作用域

局部变量的作用域仅限于定义它们的函数，但是状态变量可以有三种作用域类型。

- Public – 公共状态变量可以在内部访问，也可以通过消息访问。对于公共状态变量，将生成一个自动getter函数。
- Internal – 内部状态变量只能从当前合约或其派生合约内访问。
- Private – 私有状态变量只能从当前合约内部访问，派生合约内不能访问。



可以把合约和方法理解为父子关系，合约为父，方法为子。子总能调用父的变量，而父无法调用子的变量

示例

```solidity
pragma solidity ^0.8.0;
contract C {
  uint public data = 30;
  uint internal iData= 10;
  function x() public returns (uint) {
   data = 3; // 内部访问
   return data;
  }
}
contract Caller {
  C c = new C();
  function f() public view returns (uint) {
   return c.data(); // 外部访问
  }
}
contract D is C {
  uint storedData; // 状态变量
  function y() public returns (uint) {
   iData = 3; // 派生合约内部访问
   return iData;
  }
  function getResult() public view returns(uint){
   uint a = 1; // 局部变量
   uint b = 2;
   uint result = a + b;
   return storedData; // 访问状态变量
  }
}
```





## 重写函数

从 0.6 开始，solidity 引入了 abstract, virtual, override 几个关键字，用于重写函数。

internal是为了保护变量不被外者所看到，而子合约继承后就可以使用父合约的internal变量从而加强了安全性

示例以下：

```solidity
pragma solidity ^0.8.0;

contract Employee {
    function getSalary() public  pure virtual returns(int){
        return 1;
    }
}

contract Manager is Employee {
    function getSalary() public  pure override returns(int){
        return 2;
    }
}
```

调用 Manager 的 getSalary 函数，将会得到结果 2。

基类中可以包含没有实现代码的函数，也就是纯虚函数，那么基类必须声明为 abstract。

示例以下：

```solidity
pragma solidity ^0.8.0;

abstract contract Employee {
    function getSalary() public  pure virtual returns(int);
}

contract Manager is Employee {
    function getSalary() public  pure override returns(int){
        return 2;
    }
}
```