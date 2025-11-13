import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Bank", (m) => {
  const bank = m.contract("Bank");

  return { bank };
});
