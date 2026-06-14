import { useAppStore } from '../store/appStore'

class TimeServiceImpl {
  async init() {
    // No-op
  }

  getNow(): Date {
    return new Date();
  }

  getFirstDayOfWeek(): number {
    return useAppStore.getState().firstDayOfWeek;
  }
}

export const TimeService = new TimeServiceImpl();
