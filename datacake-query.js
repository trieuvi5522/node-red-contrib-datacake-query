const fetch = require("node-fetch"); // v2 for CJS
module.exports = function(RED){
  const DCK_URL = "https://api.datacake.co/graphql";

  function DatacakeQuery(config){
    RED.nodes.createNode(this, config);
    const node = this;
    node.configNode = RED.nodes.getNode(config.config);
    node.staticQuery = config.query || "";
    node.staticVars = config.variables;

    node.on("input", async (msg, send, done) => {
      try{
        const cfg = node.configNode;
        if(!cfg || !cfg.workspace || !cfg.token) throw new Error("Missing Datacake config (workspace/token).");

        let query = (typeof msg.query === "string" && msg.query.trim()) ? msg.query.trim() : (node.staticQuery || "");
        if(!query) throw new Error("No GraphQL query provided.");

        let variables = undefined;
        if(msg.variables) variables = msg.variables;
        else if(node.staticVars){
          try{ variables = JSON.parse(node.staticVars); } catch(e){}
        }

        query = query.replace("<UUID>", cfg.workspace);

        const r = await fetch(DCK_URL, {
          method: "POST",
          headers: {
            "Authorization": "Token " + cfg.token,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ query, variables })
        });

        const json = await r.json();
        if(!r.ok || json.errors){
          msg.statusCode = r.status;
          msg.error = json.errors || {message: "HTTP " + r.status};
          send(msg); return done();
        }

        msg.payload = json.data;
        msg.datacake = { workspace: cfg.workspace, usedVariables: variables || null };
        send(msg); done();
      }catch(err){ done(err); }
    });
  }
  RED.nodes.registerType("datacake-query", DatacakeQuery);
};
