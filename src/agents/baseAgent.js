import { EventBus, EVENTS } from '../core/eventBus.js';

export class BaseAgent {
  constructor(name, id) {
    this.name = name;
    this.id = id; // machine name e.g. 'report-analysis-agent'
  }

  // General agent log
  log(message, type = 'log') {
    const timestamp = new Date().toLocaleTimeString();
    EventBus.publish(EVENTS.AGENT_LOG, {
      agentId: this.id,
      agentName: this.name,
      timestamp,
      type, // 'log', 'success', 'warning', 'error', 'tool_call', 'tool_output'
      message
    });
  }

  // Logs tool invocations
  logToolCall(toolName, actionDescription) {
    this.log(`Invoking Tool [${toolName}] -> ${actionDescription}`, 'tool_call');
  }

  // Logs tool results
  logToolOutput(toolName, output) {
    this.log(`Returned from [${toolName}]:\n${output}`, 'tool_output');
  }

  // Wraps tool execution to handle logging automatically
  async executeTool(tool, methodName, ...args) {
    const argsStr = args.map(arg => {
      if (arg instanceof File) return `File(${arg.name})`;
      if (typeof arg === 'object') return JSON.stringify(arg);
      return String(arg);
    }).join(', ');

    this.logToolCall(tool.name, `${methodName}(${argsStr})`);
    
    try {
      const result = await tool[methodName](...args);
      
      let outputStr = '';
      if (typeof result === 'object') {
        outputStr = JSON.stringify(result, null, 2);
      } else {
        outputStr = String(result);
      }
      // Truncate output string if too long for log view
      const truncated = outputStr.length > 500 ? outputStr.slice(0, 500) + '... [truncated]' : outputStr;
      this.logToolOutput(tool.name, truncated);
      
      return result;
    } catch (error) {
      this.log(`Failed tool execution on [${tool.name}]: ${error.message}`, 'error');
      throw error;
    }
  }

  // Start marker
  start() {
    this.log(`Agent starting execution.`, 'log');
    EventBus.publish(EVENTS.AGENT_START, { agentId: this.id, agentName: this.name });
  }

  // End marker
  end(output) {
    this.log(`Agent finished execution successfully.`, 'success');
    EventBus.publish(EVENTS.AGENT_END, { agentId: this.id, agentName: this.name, output });
  }
}
