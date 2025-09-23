export class BadgeManager {
    private count: number;
    private listeners: Set<(count: number) => void>;
    private notifCount: number;
    private notifListeners: Set<(notifCount: number) => void>;
  
    constructor() {
      this.count = 0;
      this.listeners = new Set();
      this.notifCount = 0;
      this.notifListeners = new Set();
    }
  
    // Subscribe for updates
    subscribe(listener: (count: number) => void) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }

    notifSubscribe(notifListeners: (notifCount: number) => void) {
      this.notifListeners.add(notifListeners);
      return () => this.notifListeners.delete(notifListeners);
    }
  
    // Notify all listeners
    private notify() {
      this.listeners.forEach((listener) => listener(this.count));
    }

    private notifNotify() {
      this.notifListeners.forEach((notifListeners) => notifListeners(this.notifCount));
    }
  
    // Increment badge count
    increment() {
      this.count++;
      this.notify();
    }

    notifIncrement() {
      this.notifCount++;
      this.notifNotify();
    }
  
    // Decrement badge count
    decrement() {
      if (this.count > 0) {
        this.count--;
        this.notify();
      }
    }

    notifDecrement() {
      if (this.notifCount > 0) {
        this.notifCount--;
        this.notifNotify();
      }
    }
  
    // Reset badge count
    reset() {
      this.count = 0;
      this.notify();
    }

    notifReset() {
      this.notifCount = 0;
      this.notifNotify();
    }
  
    // Get current badge count
    getCount() {
      return this.count;
    }

    getNotifCount() {
      return this.notifCount;
    }
  }
  