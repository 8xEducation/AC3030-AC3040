import { useAppStore } from '../store/appStore'

class TimeServiceImpl {
  private offsetMs: number = 0;

  async init() {
    const { timeSyncMode } = useAppStore.getState();
    if (timeSyncMode === 'network') {
      await this.syncNetworkTime();
    } else {
      this.offsetMs = 0;
      useAppStore.getState().setNetworkTimezone(null);
    }
  }

  async syncNetworkTime() {
    try {
      const response = await fetch('http://worldtimeapi.org/api/ip');
      const data = await response.json();
      const serverDate = new Date(data.utc_datetime);
      this.offsetMs = serverDate.getTime() - Date.now();
      useAppStore.getState().setNetworkTimezone(data.timezone);
    } catch (e) {
      console.warn('Failed to sync network time, falling back to device time', e);
      this.offsetMs = 0;
      useAppStore.getState().setNetworkTimezone(null);
    }
  }

  getNow(): Date {
    const { timeSyncMode } = useAppStore.getState();
    if (timeSyncMode === 'network') {
      return new Date(Date.now() + this.offsetMs);
    }
    return new Date();
  }

  getFirstDayOfWeek(): number {
    return useAppStore.getState().firstDayOfWeek;
  }
}

export const TimeService = new TimeServiceImpl();
