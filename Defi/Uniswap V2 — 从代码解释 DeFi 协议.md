# Uniswap V2 — 从代码解释 DeFi 协议

为了理解我们在分析代码时将要经历的不同组件，首先了解哪些是主要概念**以及**它们**的作用**是很重要的。所以，和我一起裸露吧，因为这是值得的。

我在 5 个段落中总结了您需要了解的主要重要概念，您将在本文结束时理解这些概念。

Uniswap 是一种**去中心化交易**[**协议**](https://uniswap.io/)。该协议是一套持久的、不可升级的智能合约，它们共同创建了一个自动化的做市商。

Uniswap 生态系统**由**贡献流动性的流动性提供者、交换代币的交易员和与智能合约交互以开发代币新交互的开发人员组成。

每个 Uniswap**智能合约或对管理一个**由两个 ERC-20 代币储备组成的流动资金池。

每个流动性池重新平衡以保持 50/50 比例的加密货币资产，这反过来又决定了资产的价格。

**流动性提供者**可以是任何能够向 Uniswap 交易合约提供等值的 ETH 和 ERC-20 代币的人。作为回报，他们从交易合约中获得**流动性提供者代币**（LP 代币代表流动性提供者拥有的池的份额），可用于随时提取其在流动性池中的比例。

他们存储库中的主要智能合约是：

- `UniswapV2ERC20`— 用于 LP 令牌的扩展 ERC20 实现。它还实施了 EIP-2612 以支持链下传输批准。
- `UniswapV2Factory`— 与 V1 类似，这是一个工厂合约，它创建配对合约并充当它们的注册表。注册表使用 create2 来生成对地址——我们将详细了解它是如何工作的。
- `UniswapV2Pair`— 负责核心逻辑的主合约。值得注意的是，工厂只允许创建独特的货币对，以免稀释流动性。
- `UniswapV2Router`— Uniswap UI 和其他在 Uniswap 之上工作的网络和去中心化应用程序的主要入口点。
- `UniswapV2Library `— 一组实现重要计算的辅助函数。

在这篇文章中，我们将提及所有这些，但我们将主要关注浏览`UniswapV2Router`和`UniswapV2Factory`编码，尽管`UniswapV2Pair`并且`UniswapV2Library`会涉及很多。

# **UniswapV2Router02.sol**

> 该合约使创建货币对、添加和删除流动性、计算所有可能的掉期变化的价格以及执行实际掉期变得更加容易。路由器适用于通过工厂合约部署的所有对

您需要在合约中创建一个实例才能调用 addLiquidity、removeLiquidity 和 swapExactTokensForTokens 函数

```
address private constant ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

IUniswapV2Router02 public uniswapV2Router;
uniswapV2Router = IUniswapV2Router02(ROUTER);
```

现在让我们看看流动性管理：

******函数****** [**addLiquidity**](https://github.com/Uniswap/v2-periphery/blob/0335e8f7e1bd1e8d8329fd300aea2ef2f36dd19f/contracts/UniswapV2Router02.sol#L61)**():**

```
function addLiquidity(
    address tokenA,
    address tokenB,
    uint amountADesired,
    uint amountBDesired,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
) external returns (uint amountA, uint amountB, uint liquidity);
```

- **tokenA**和**tokenB**：是我们需要获取或创建我们想要增加流动性的货币对的代币。
- **amountADesired**和**amountBDesired**是我们要存入流动资金池的金额。
- **amountAMin**和**amountBMin**是我们要存入的最小金额。
- **to** address 是接收 LP 代币的地址。
- **截止日期**，最常见的是`block.timestamp`

在内部 _addLiquidity() 中，它将[检查这两个令牌中的一对是否已经存在](https://github.com/Uniswap/v2-periphery/blob/0335e8f7e1bd1e8d8329fd300aea2ef2f36dd19f/contracts/UniswapV2Router02.sol#L42)，如果不存在，它将创建一个新令牌

```
if (IUniswapV2Factory(factory).getPair(tokenA, tokenB) == address(0)) {
    IUniswapV2Factory(factory).createPair(tokenA, tokenB);
}
```

然后它需要获取现有的代币数量或也称为`reserveA`and `reserveB`，我们可以通过 UniswapV2Pair 合约访问它

```
IUniswapV2Pair(pairFor(factory, tokenA, tokenB)).getReserves()
```

现在，外部函数 addLiquidity, 返回`(uint amountA, uint amountB, uint liquidity)`，那么它是如何计算的呢？

[通过UniswapV2Library拿到上面提到的reserves](https://github.com/Uniswap/v2-periphery/blob/0335e8f7e1bd1e8d8329fd300aea2ef2f36dd19f/contracts/libraries/UniswapV2Library.sol#L31)之后，还有一系列的检查

如果[该对不存在，并且新创建](https://github.com/Uniswap/v2-periphery/blob/0335e8f7e1bd1e8d8329fd300aea2ef2f36dd19f/contracts/UniswapV2Router02.sol#L46) `amountA`并`amountB`返回一个新的，则将`amountADesired`作为`amountBDesired`参数传递（见上文）。

否则，它会做这个操作

```
amountBOptimal = amountADesired.mul(reserveB) / reserveA;
```

如果`amountB`小于[或等于](https://github.com/Uniswap/v2-periphery/blob/0335e8f7e1bd1e8d8329fd300aea2ef2f36dd19f/contracts/UniswapV2Router02.sol#L50)，`amountBDesired`那么它将返回：

```
(uint amountA, uint amountB) = (amountADesired, amountBOptimal)
```

否则，它将返回

```
(uint amountA, uint amountB) = (amountAOptimal, amountBDesired)
```

其中`amountAOptimal`的计算方式与`amountBOptimal`

然后，要计算`liquidity`返回值将经过以下过程：

首先，它将使用现有/新创建的对的地址部署 UniswapV2Pair 合约。

它是如何做到的？它计算一对的 CREATE2 地址而无需进行任何外部调用：（[阅读有关 CREATE2 Opcode 的更多信息](https://docs.openzeppelin.com/cli/2.8/deploying-with-create2)）

```
pair = address(uint(keccak256(abi.encodePacked(address(uint(keccak256(abi.encodePacked(
    hex'ff',
    factory,
    keccak256(abi.encodePacked(token0, token1)),
    hex'96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f' // init code hash
))));
```

然后，它获取新部署合约的地址，我们需要用它来从这对代币中铸造代币。

当您向货币对添加流动性时，合约**会生成 LP 代币**；当你移除流动性时，LP 代币就会被销毁。

`pairFor`因此，首先我们使用UniswapV2Library获取地址：

```
address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);UniswapV2Library.pairFor(factory, tokenA, tokenB);
```

因此，稍后可以铸造 ERC20 代币并计算返回的[流动性：](https://github.com/Uniswap/v2-core/blob/ee547b17853e71ed4e0101ccfd52e70d5acded58/contracts/UniswapV2Pair.sol#L120)

```
liquidity = IUniswapV2Pair(pair).mint(to);
```

如果您想知道为什么它最终成为 ERC20，在 mint 函数中它是[这样存储的](https://github.com/Uniswap/v2-core/blob/ee547b17853e71ed4e0101ccfd52e70d5acded58/contracts/UniswapV2Pair.sol#L112)https://github.com/Uniswap/v2-core/blob/ee547b17853e71ed4e0101ccfd52e70d5acded58/contracts/UniswapV2Pair.sol#L112)

```
uint balance0 = IERC20(token0).balanceOf(address(this));
uint balance1 = IERC20(token1).balanceOf(address(this));
```

****函数**removeLiquidity():**

```
function removeLiquidity(
    address tokenA,
    address tokenB,
    uint liquidity,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
) external returns (uint amountA, uint amountB);
```

> 从池中移除流动性意味着燃烧 LP 代币以换取一定数量的基础代币。

```
IUniswapV2Pair(pair).transferFrom(msg.sender, pair, liquidity);
```

然后，外部函数返回两个值`(uint amountA, uint amountB)`，这些值是使用传递给函数的参数计算的。

随提供的流动性返回的代币数量[计算如下](https://github.com/Uniswap/v2-core/blob/ee547b17853e71ed4e0101ccfd52e70d5acded58/contracts/UniswapV2Pair.sol#L144)：

```
amount0 = liquidity.mul(balance0) / _totalSupply; 
amount1 = liquidity.mul(balance1) / _totalSupply;
```

然后它将[这些数量的代币转移到指定的地址](https://github.com/Uniswap/v2-core/blob/ee547b17853e71ed4e0101ccfd52e70d5acded58/contracts/UniswapV2Pair.sol#L148)

```
_safeTransfer(_token0, to, amount0);
_safeTransfer(_token1, to, amount1);
```

您的 LP 代币份额越大，销毁后获得的储备份额就越大。

上面的这些计算发生[在 burn 函数内部](https://github.com/Uniswap/v2-periphery/blob/0335e8f7e1bd1e8d8329fd300aea2ef2f36dd19f/contracts/UniswapV2Router02.sol#L114)

```
IUniswapV2Pair（对）.burn（对）
```

https://github.com/Uniswap/v2-periphery/blob/0335e8f7e1bd1e8d8329fd300aea2ef2f36dd19f/contracts/UniswapV2Router02.sol#L114)

```
IUniswapV2Pair(pair).burn(to)
```

****函数**swapExactTokensForTokens()**



```
function swapExactTokensForTokens(
    uint amountIn,
    uint amountOutMin,
    address[] calldata path,
    address to,
    uint deadline
) external returns (uint[] memory amounts);
```

> Uniswap 的核心功能是交换代币，所以让我们弄清楚代码中发生了什么，以便更好地理解它

您很可能听说过流动资金池中使用的[神奇公式](https://github.com/Uniswap/v2-periphery/blob/0335e8f7e1bd1e8d8329fd300aea2ef2f36dd19f/contracts/libraries/UniswapV2Library.sol#L49)

```
X * Y = K
```

所以，这将首先发生在 swap 函数内部`getAmountOut()`。

里面用到的关键函数有：

```
TransferHelper.safeTransferFrom().safeTransferFrom()
```

[代币金额发送](https://github.com/Uniswap/v2-periphery/blob/0335e8f7e1bd1e8d8329fd300aea2ef2f36dd19f/contracts/UniswapV2Router02.sol#L233)到配对代币的地方

在 UniswapV2Pair 合约的较低级别交换功能中，它将是

```
_safeTransfer(_token, to, amountOut);
```

这将[实际转移](https://github.com/Uniswap/v2-core/blob/ee547b17853e71ed4e0101ccfd52e70d5acded58/contracts/UniswapV2Pair.sol#L170)回预期地址。

> *我知道信息量很大，但您将有足够的时间阅读所有内容，直到完全理解为止。所以……*



# **UniswapV2Factory.sol**

> 工厂合约是所有已部署对合约的注册表。这个合约是必要的，因为我们不希望有成对的相同代币，这样流动性就不会分成多个相同的对。
>
> 该合约还简化了配对合约的部署：无需通过任何外部调用手动部署配对合约，只需调用工厂合约中的方法即可。

好吧，让我们倒回去，因为在上面的这些行中已经说了非常重要的事情。我们把它们拆分开来分别分析：

**该合约是所有已部署对合约的注册表**

只部署了一个工厂合约，该合约用作 Uniswap 交易对的官方注册处。

现在，我们在代码中的什么地方看到了它以及发生了什么：

```
address[] public allPairs;
```

它有 的数组`allPairs`，如上所述，存储在这个合约中。这些对被添加到一个方法中，该方法`createPair()`通过[将新初始化的对推](https://github.com/Uniswap/v2-core/blob/ee547b17853e71ed4e0101ccfd52e70d5acded58/contracts/UniswapV2Factory.sol#L36)送到数组来调用。

```
allPairs.push(pair);push(pair);
```

**这个合约是必要的，因为**[**我们不想拥有成对的相同代币**](https://github.com/Uniswap/v2-core/blob/ee547b17853e71ed4e0101ccfd52e70d5acded58/contracts/UniswapV2Factory.sol#L27)

```
mapping(address => mapping(address => address)) public getPair;
```

它具有该对的地址与构成该对的两个令牌的映射。这用于检查一对是否已经存在。

```
require(getPair[token0][token1] == address(0), 'UniswapV2: PAIR_EXISTS');
```

**该合约还简化了配对合约的部署**

这是一个更深层次的话题，但我将尝试总结一下这里发生的事情的重要性。

在以太坊中，合约可以部署合约。可以调用已部署合约的函数，该函数将部署另一个合约。

您不需要从您的计算机上编译和部署合约，您可以通过现有合约来执行此操作。

> *那么，Uniswap 是如何部署智能合约的呢？*

通过使用操作码**CREATE2**

```
bytes memory bytecode = type(UniswapV2Pair).creationCode;type(UniswapV2Pair).creationCode;
bytes32 salt = keccak256(abi.encodePacked(token0, token1));
assembly {
    pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
}
```

在第一行，我们得到创建字节码`UniswapV2Pair`

下一行创建了`salt`一个字节序列，用于确定性地生成新合约的地址。

最后一行是我们调用以使用+`create2`确定性地创建新地址的地方。部署。`bytecode``salt``UniswapV2Pair`

并得到对地址，我们可以看到这是`createPair()`函数的返回值

```
function createPair(
  address tokenA, address tokenA, 
  address tokenB
) external returns (address pair)
```

[当提供的标记不是现有的对](https://github.com/Uniswap/v2-periphery/blob/0335e8f7e1bd1e8d8329fd300aea2ef2f36dd19f/contracts/UniswapV2Router02.sol#L43)`_addLiquidity()`时，它在内部函数中使用。

所以，这就是关于 Uniswap 代码的全部内容。

现在，为了看到我们测试的所有内容，我可以推荐您查看 Smart Contract Programmer 在他的[defi-by-example 内容](https://github.com/stakewithus/defi-by-example/blob/main/contracts/TestUniswapLiquidity.sol)中实现的代码，他已经[在视频中进行了解释](https://youtu.be/816kTTNzcHs)。

在这里你可以看到我们可以增加流动性的方式**：**

```
function addLiquidity(
  address _tokenA,
  address _tokenB,
  uint _amountA,
  uint _amountB
) external {
  IERC20(_tokenA).transferFrom(msg.sender, address(this), _amountA);
  IERC20(_tokenB).transferFrom(msg.sender, address(this), _amountB);

  IERC20(_tokenA).approve(ROUTER, _amountA);
  IERC20(_tokenB).approve(ROUTER, _amountB);

  (uint amountA, uint amountB, uint liquidity) =
    IUniswapV2Router(ROUTER).addLiquidity(
      _tokenA,
      _tokenB,
      _amountA,
      _amountB,
      1,
      1,
      address(this),
      block.timestamp
    );

  emit Log("amountA", amountA);
  emit Log("amountB", amountB);
  emit Log("liquidity", liquidity);
}
```

以及我们必须如何考虑**消除流动性**：

```
function removeLiquidity(address _tokenA, address _tokenB) external {
  address pair = IUniswapV2Factory(FACTORY).getPair(_tokenA, _tokenB);

  uint liquidity = IERC20(pair).balanceOf(address(this));
  IERC20(pair).approve(ROUTER, liquidity);

  (uint amountA, uint amountB) =
    IUniswapV2Router(ROUTER).removeLiquidity(
      _tokenA,
      _tokenB,
      liquidity,
      1,
      1,
      address(this),
      block.timestamp
    );

  emit Log("amountA", amountA);
  emit Log("amountB", amountB);
}
```

