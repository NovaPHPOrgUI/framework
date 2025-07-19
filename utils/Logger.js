/**
 * 日志工具类
 * 提供分级日志输出功能，支持不同级别的日志记录
 * @file Logger.js
 * @author License Auto System
 * @version 1.0.0
 */

/*
 * Copyright (c) 2025. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

/**
 * 日志工具类
 * 提供分级日志输出功能，支持时间戳和颜色区分
 */
class Logger {
  /**
   * 构造函数
   * 初始化日志级别配置
   */
  constructor() {
    /** @type {Object} 日志级别定义 */
    this.levels = {
      debug: 0,
      info: 1,
      success: 2,
      warn: 3,
      error: 4,
    };
    /** @type {number} 当前日志级别 */
    this.currentLevel = this.levels.info; // 默认日志级别
  }

  /**
   * 设置最小日志级别
   * @param {string} level - 日志级别名称
   */
  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.currentLevel = this.levels[level];
    } else {
      console.warn("Invalid log level:", level);
    }
  }

  /**
   * 获取当前时间戳，使用东8区（北京时间）
   * @returns {string} 格式化的时间戳字符串
   */
  getTimestamp() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000; // 修正为 60000 毫秒
    const offset = 8 * 3600 * 1000; // 东8区偏移量
    const beijingTime = new Date(utc + offset);
    return beijingTime.toISOString().replace("T", " ").substring(0, 23); // 精确到毫秒
  }

  /**
   * 输出信息，支持多个变量
   * @param {...any} messages - 要输出的消息，最后一个参数可以是日志级别
   */
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

  /**
   * 获取指定级别的样式
   * @param {string} level - 日志级别
   * @returns {string} CSS样式字符串
   */
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

  /**
   * 获取指定级别对应的控制台方法
   * @param {string} level - 日志级别
   * @returns {Function} 控制台方法
   */
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

  /**
   * 输出调试级别日志
   * @param {...any} messages - 要输出的消息
   */
  debug(...messages) {
    this.log(...messages, "debug");
  }

  /**
   * 输出信息级别日志
   * @param {...any} messages - 要输出的消息
   */
  info(...messages) {
    this.log(...messages, "info");
  }

  /**
   * 输出警告级别日志
   * @param {...any} messages - 要输出的消息
   */
  warn(...messages) {
    this.log(...messages, "warn");
  }

  /**
   * 输出错误级别日志
   * @param {...any} messages - 要输出的消息
   */
  error(...messages) {
    this.log(...messages, "error");
  }

  /**
   * 输出成功级别日志
   * @param {...any} messages - 要输出的消息
   */
  success(...messages) {
    this.log(...messages, "success");
  }
}

/**
 * 使用示例
 * $.logger.debug("调试信息");
 * $.logger.info("普通信息");
 * $.logger.success("成功信息");
 * $.logger.warn("警告信息");
 * $.logger.error("错误信息");
 */

/** @type {Logger} 全局日志工具实例 */
$.logger = new Logger();
