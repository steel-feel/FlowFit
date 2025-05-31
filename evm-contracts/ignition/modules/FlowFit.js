const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const FlowFitModule = buildModule("FlowFitModule", (m) => {
  const flowFit = m.contract("FlowFit", []);

  return { flowFit };
});

module.exports = FlowFitModule;
