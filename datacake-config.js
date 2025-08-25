module.exports = function(RED){
  function DatacakeConfig(n){
    RED.nodes.createNode(this, n);
    this.name = n.name;
    this.workspace = n.workspace;
    this.token = this.credentials && this.credentials.token;
  }
  RED.nodes.registerType("datacake-config", DatacakeConfig, {
    credentials: { token: { type: "password" } }
  });
};
