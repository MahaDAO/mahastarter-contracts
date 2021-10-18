pragma solidity 0.5.8;

contract HelloWorld {
  string saySomething;

  constructor() public {
    saySomething = "Hello World!";
  }

  function speak() public view returns (string memory) {
    return saySomething;
  }
}
