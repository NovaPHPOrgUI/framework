/*
 * Copyright (c) 2025. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

class Logger {
  constructor() {
    this.levels = {
      debug: 0,
      info: 1,
      success: 2,
      warn: 3,
      error: 4,
    };
    this.currentLevel = this.levels.info; // 默认日志级别
  }

  // 设置最小日志级别
  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.currentLevel = this.levels[level];
    } else {
      console.warn("Invalid log level:", level);
    }
  }

  // 获取当前时间戳，使用东8区（北京时间）
  getTimestamp() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000; // 修正为 60000 毫秒
    const offset = 8 * 3600 * 1000; // 东8区偏移量
    const beijingTime = new Date(utc + offset);
    return beijingTime.toISOString().replace("T", " ").substring(0, 23); // 精确到毫秒
  }

  // 输出信息，支持多个变量
  log(...messages) {
    const level =
      typeof messages[messages.length - 1] === "string" &&
      this.levels[messages[messages.length - 1]] !== undefined
        ? messages.pop()
        : "info";

    if (this.levels[level] >= this.currentLevel) {
      const timestamp = `[${this.getTimestamp()}] [${level.toUpperCase()}]`;
      const style = this.getStyle(level);

      if (messages.length === 1 && typeof messages[0] === "string") {
        console.log(`%c${timestamp} ${messages[0]}`, style);
      } else {
        console.log(`%c${timestamp}`, style, ...messages);
      }
    }
  }

  getStyle(level) {
    const colors = {
      debug: "color: #6c757d;", // 灰色
      info: "color: #007bff;", // 蓝色
      success: "color: #28a745;", // 绿色
      warn: "color: #ffc107;", // 黄色
      error: "color: #dc3545;", // 红色
    };
    return colors[level] || "color: #007bff;"; // 默认蓝色
  }

  getConsoleMethod(level) {
    const methods = {
      debug: console.debug,
      info: console.info,
      success: console.log, // 没有 console.success 方法，使用 log
      warn: console.warn,
      error: console.error,
    };
    return methods[level] || console.log;
  }

  debug(...messages) {
    this.log(...messages, "debug");
  }

  info(...messages) {
    this.log(...messages, "info");
  }

  warn(...messages) {
    this.log(...messages, "warn");
  }

  error(...messages) {
    this.log(...messages, "error");
  }

  success(...messages) {
    this.log(...messages, "success");
  }
}

// 使用示例
$.logger = new Logger();
