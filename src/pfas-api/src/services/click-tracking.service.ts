/**
 * Click Tracking Service for PFAS-Free Kitchen Platform
 * Tracks affiliate clicks with bot detection and fraud prevention
 */

import { logger } from '../config/logger.js';
import { ClickRepository } from '../repositories/click.repository.js';
import type {
  ClickParams,
  BotCheckResult,
  ClickTrackingResult,
  AggregateParams,
  ClickAnalytics,
  BOT_USER_AGENT_PATTERNS,
} from '../types/affiliate.types.js';

// Known bot user agent patterns
const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebot/i,
  /ia_archiver/i,
  /mj12bot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /dotbot/i,
  /petalbot/i,
  /sogou/i,
  /exabot/i,
  /archive\.org_bot/i,
  /bot[\s_-]?/i,
  /crawler/i,
  /spider/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
];

// Known bot user agent hashes (pre-computed for common bots)
const KNOWN_BOT_UA_HASHES = new Set([
  // Add hashes of known bot UAs here
]);

export class ClickTrackingService {
  /**
   * Record an affiliate click
   */
  static async trackClick(params: ClickParams): Promise<ClickTrackingResult> {
    logger.debug({ params }, 'Processing click tracking request');

    // Bot detection
    const botCheck = await this.detectBot(params);
    
    if (botCheck.isBot) {
      logger.info({ reason: botCheck.reason }, 'Bot click detected');
      
      // Still record but flag as bot
      const clickId = await ClickRepository.create({
        ...params,
        isBot: true,
        botDetectionReason: botCheck.reason || undefined,
      });
      
      return { clickId, tracked: false };
    }

    // Duplicate click detection (same session, same product, within 5 min)
    const isDuplicate = await this.isDuplicateClick(params);
    
    if (isDuplicate) {
      logger.debug({ params }, 'Duplicate click detected, skipping');
      return { clickId: '', tracked: false };
    }

    // Record valid click
    const clickId = await ClickRepository.create({
      ...params,
      isBot: false,
    });

    // Publish event for analytics (async, don't await)
    this.publishClickEvent(clickId, params).catch((err) => {
      logger.error({ err, clickId }, 'Failed to publish click event');
    });

    logger.info({ clickId, productId: params.productId }, 'Click tracked successfully');

    return { clickId, tracked: true };
  }

  /**
   * Bot detection heuristics
   */
  private static async detectBot(params: ClickParams): Promise<BotCheckResult> {
    // Check 1: Known bot user agent hash
    if (params.userAgentHash && KNOWN_BOT_UA_HASHES.has(params.userAgentHash)) {
      return { isBot: true, reason: 'known_bot_ua_hash' };
    }

    // Check 2: Click velocity (same session)
    if (params.sessionId) {
      const recentClicks = await ClickRepository.countRecentBySession(
        params.sessionId,
        { withinMinutes: 1 }
      );
      
      // More than 10 clicks per minute is suspicious
      if (recentClicks > 10) {
        return { isBot: true, reason: 'high_velocity' };
      }
      
      // More than 3 clicks per minute to same retailer is suspicious
      // (Would need additional repository method to check this)
    }

    // Check 3: Missing referrer on tracked pages
    // This isn't definitive (privacy extensions block referrers), so just log it
    if (!params.referrerPage) {
      logger.debug({ sessionId: params.sessionId }, 'Click without referrer');
      // Not marking as bot, but could be used in combination with other signals
    }

    return { isBot: false, reason: null };
  }

  /**
   * Check if user agent matches known bot patterns
   * (Used when we have the raw user agent, not just hash)
   */
  static isKnownBotUserAgent(userAgent: string): boolean {
    return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
  }

  /**
   * Check for duplicate clicks (same user, same product, same retailer, within time window)
   */
  private static async isDuplicateClick(params: ClickParams): Promise<boolean> {
    // If no session ID, can't detect duplicates effectively
    if (!params.sessionId) {
      return false;
    }

    const recent = await ClickRepository.findRecent({
      sessionId: params.sessionId,
      productId: params.productId,
      retailerId: params.retailerId,
      withinMinutes: 5, // 5 minute dedup window
    });

    return recent !== null;
  }

  /**
   * Publish click event for analytics
   */
  private static async publishClickEvent(clickId: string, params: ClickParams): Promise<void> {
    // In production, publish to event bus (SNS/SQS, Kafka, etc.)
    logger.debug({
      event: 'click.tracked',
      clickId,
      productId: params.productId,
      retailerId: params.retailerId,
      timestamp: new Date(),
    }, 'Click event published');

    /* Event bus implementation:
    await EventBus.publish('click.tracked', {
      clickId,
      productId: params.productId,
      retailerId: params.retailerId,
      timestamp: new Date(),
    });
    */
  }

  /**
   * Get click analytics (admin)
   */
  static async getAnalytics(params: AggregateParams): Promise<ClickAnalytics> {
    logger.debug({ params }, 'Fetching click analytics');
    return ClickRepository.aggregate(params);
  }

  /**
   * Detect bot from raw user agent string
   * (Use when hashing user agent server-side)
   */
  static async detectBotFromUserAgent(
    userAgent: string,
    sessionId?: string
  ): Promise<BotCheckResult> {
    // Check against known patterns
    if (this.isKnownBotUserAgent(userAgent)) {
      return { isBot: true, reason: 'known_bot_ua' };
    }

    // Check for suspicious characteristics
    if (userAgent.length < 10) {
      return { isBot: true, reason: 'short_ua' };
    }

    if (!userAgent.includes('Mozilla') && !userAgent.includes('Opera')) {
      // Most real browsers identify as Mozilla-compatible
      return { isBot: true, reason: 'non_browser_ua', confidence: 0.7 };
    }

    return { isBot: false, reason: null };
  }
}
