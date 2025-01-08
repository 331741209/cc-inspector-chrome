export class Chunk {
  /**
   * 显示的值
   */
  value: string = "";
  /**
   * 是否换行
   */
  private newline: boolean = false;
  /**
   * 显示的样式
   */
  style: string[] = [];
  constructor(v: string, newline: boolean = false) {
    this.value = v;
    this.newline = newline;
  }
  color(c: string) {
    this.style.push(`color:${c}`);
    return this;
  }
  background(c: string) {
    this.style.push(`background:${c}`);
    return this;
  }
  padding(c: string) {
    this.style.push(`padding:${c}`);
    return this;
  }
  fontwight(c: string) {
    this.style.push(`font-weight:${c}`);
    return this;
  }
  bold() {
    return this.fontwight("bold");
  }
  margin(c: string) {
    this.style.push(`margin:${c}`);
    return this;
  }
  marginLeft(c: string) {
    this.style.push(`margin-left:${c}`);
    return this;
  }
  marginRight(c: string) {
    this.style.push(`margin-right:${c}`);
    return this;
  }
  toValue() {
    return `%c${this.value}${this.newline ? "\n" : ""}`;
  }
  toStyle() {
    return this.style.join(";");
  }
}

export class Terminal {
  /**
   * 标签
   */
  tag = "terminal";
  /**
   * 子标签
   */
  subTag = "";
  /**
   * 标签的颜色
   */
  tagColor = "blue";
  /**
   * 标签的背景色
   */
  tagBackground = "yellow";
  /**
   * 日志文本的颜色
   */
  txtColor = "black";
  private chunks: Chunk[] = [];
  constructor(tag: string) {
    this.tag = tag;
  }
  init(): string[] {
    this.txtColor = "black";
    this.subTag = "init";
    return this.log();
  }

  public log(message: string = "", newline: boolean = false): string[] {
    const txt = new Chunk(message).color(this.txtColor).background("#e6e6e6").marginLeft("5px");
    return this.doChunk(newline, [txt]);
  }
  public chunkMessage(chunk: Chunk[]) {
    this.subTag = "message";
    return this.doChunk(false, chunk);
  }

  public chunkSend(chunk: Chunk[]) {
    this.subTag = "send   ";
    return this.doChunk(false, chunk);
  }
  private doChunk(newline: boolean = false, chunks: Chunk[]) {
    this.chunks = [];
    const tag = new Chunk(this.tag).color(this.tagColor).background(this.tagBackground).padding("0 4px");
    this.chunks.push(tag);

    const subTag = new Chunk(this.subTag, newline).color(this.tagBackground).background(this.tagColor).padding("0 3px");
    this.chunks.push(subTag);

    chunks.forEach((c) => {
      this.chunks.push(c);
    });

    let head = "*";
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      head += chunk.toValue();
    }
    const ret = [head];
    this.chunks.forEach((chunk) => {
      ret.push(chunk.toStyle());
    });
    this.reset();
    return ret;
  }
  private reset() {
    this.subTag = "";
  }
  public blue(message: string): string[] {
    this.txtColor = "blue";
    this.subTag = "";
    return this.log(message);
  }
  public green(message: string): string[] {
    this.txtColor = "green";
    this.subTag = "";
    return this.log(message);
  }
  public red(message: string): string[] {
    this.txtColor = "red";
    this.subTag = "";
    return this.log(message);
  }
  send(msg: string) {
    this.txtColor = "black";
    this.subTag = "send";
    return this.log(`${msg}`);
  }
  message(msg: string): string[] {
    this.txtColor = "black";
    this.subTag = "message";
    return this.log(`${msg}`);
  }
  connect(msg: string): string[] {
    this.txtColor = "black";
    this.subTag = "connect";
    return this.log(`${msg}`);
  }
  disconnect(msg: string): string[] {
    this.txtColor = "black";
    this.subTag = "disconnect";
    return this.log(`${msg}`);
  }
}
