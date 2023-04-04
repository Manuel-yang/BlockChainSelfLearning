# Solidity中的Withdraw模式和Restricted

当在智能合约中，直接向一个地址转账时，如该地址是一个合约地址，合约中可以编写代码，拒绝接受付款，导致交易失败。为避免这种情况，通常会使用提款模式。

提款模式是让收款方主动来提取款项，而不是直接转账给收款方。



直接转账给收款方。

这是个比富游戏，智能合约接收用户发送的款项(以太)，金额最高的将获得首富头衔，前一位首富失去头衔，但将获得金钱补偿，当前首富发送的款项，将转账给前首富(示例中此处使用直接转账)。

不理解游戏没关系，重点是转账给前首富时，是直接转账。

```solidity
pragma solidity ^0.8.0;
contract Test {
   address payable public richest;
   uint public mostSent;
   constructor() public payable {
      richest = msg.sender;
      mostSent = msg.value;
   }
   function becomeRichest() public payable returns (bool) {
      if (msg.value > mostSent) {
         // 转账给前首富，不安全方法，对方可以拒绝收款，导致交易失败，从而导致当前智能合约失败，游戏不能继续
         richest.transfer(msg.value);
         richest = msg.sender;
         mostSent = msg.value;
         return true;
      } else {
         return false;
      }
   }
}
```



提款模式，让收款方(前首富)主动来提取款项，交易不会失败，游戏可以继续。

```solidity
pragma solidity ^0.8.0;
contract Test {
   address public richest;
   uint public mostSent;
   mapping (address => uint) pendingWithdrawals;
   constructor() public payable {
      richest = msg.sender;
      mostSent = msg.value;
   }
   function becomeRichest() public payable returns (bool) {
      if (msg.value > mostSent) {
         // 此处不直接转账，暂时记录应付款项
         pendingWithdrawals[richest] += msg.value;
         richest = msg.sender;
         mostSent = msg.value;
         return true;
      } else {
         return false;
      }
   }
   // 收款方调用这个函数，主动提取款项
   function withdraw() public {
      uint amount = pendingWithdrawals[msg.sender];
      pendingWithdrawals[msg.sender] = 0;
      msg.sender.transfer(amount);
   }
}
```





# Solidity 限制(restricted)访问

对合约进行访问限制，是一种常见做法。默认情况下合约是只读的，除非将合约状态指定为public。

使用限制访问修饰符，我们可以限制谁能修改合约状态，或者调用合约函数等操作。

下面示例中，创建了多个修饰符：

onlyBy 限制可以调用该函数的调用者（根据地址）。onlyAfter 限制该函数只能在特定的时间段之后调用。costs 调用方只能在提供特定值的情况下调用此函数。。

示例

```solidity
pragma solidity ^0.8.0;
contract Test {
   address public owner = msg.sender;
   uint public creationTime = now;
   modifier onlyBy(address _account) {
      require(
         msg.sender == _account,
         "Sender not authorized."
      );
      _;
   }
   function changeOwner(address _newOwner) public onlyBy(owner) {
      owner = _newOwner;
   }
   modifier onlyAfter(uint _time) {
      require(
         now >= _time,
         "Function called too early."
      );
      _;
   }
   function disown() public onlyBy(owner) onlyAfter(creationTime + 6 weeks) {
      delete owner;
   }
   modifier costs(uint _amount) {
      require(
         msg.value >= _amount,
         "Not enough Ether provided."
      );
      _;
      if (msg.value > _amount)
         msg.sender.transfer(msg.value-_amount);
   }
   function forceOwnerChange(address _newOwner) public payable costs(200 ether) {
      owner = _newOwner;
      if (uint(owner) & 0 == 1) return;        
   }
}
```