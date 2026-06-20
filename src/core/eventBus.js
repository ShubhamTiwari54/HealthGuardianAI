class EventBusClass {
  constructor() {
    this.events = {};
  }

  // Subscribe to an event
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return () => this.unsubscribe(event, callback);
  }

  // Unsubscribe from an event
  unsubscribe(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  // Publish an event with data
  publish(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error in event subscriber for '${event}':`, err);
      }
    });
  }
}

export const EventBus = new EventBusClass();

// Event Name Constants
export const EVENTS = {
  AGENT_START: 'agent_start',
  AGENT_LOG: 'agent_log',
  AGENT_END: 'agent_end',
  ORCHESTRATION_START: 'orchestration_start',
  ORCHESTRATION_END: 'orchestration_end',
  DATA_UPDATED: 'data_updated'
};
