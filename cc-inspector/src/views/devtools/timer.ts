export class Timer {
  private timer: number = 0;
  private callback: Function | null = null;
  private duration: number = 0;
  constructor(cb: Function = null, duration: number = 300) {
    this.callback = cb;
    this.duration = duration;
  }
  create() {
    this.clean();
    this.timer = setInterval(this.callback, this.duration);
  }
  clean() {
    clearInterval(this.timer);
  }
}
