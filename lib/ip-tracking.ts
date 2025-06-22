
import { prisma } from './db';
import { NextRequest } from 'next/server';

export interface IpTrackingData {
  ip: string;
  userAgent: string;
  userId?: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
  responseTime?: number;
}

export interface SecurityEvent {
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'failed_auth' | 'blocked_ip' | 'admin_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userAgent: string;
  userId?: string;
  description: string;
  metadata?: Record<string, any>;
}

export class IpTracker {
  // Log general activity
  async logActivity(data: IpTrackingData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId || null,
          action: data.action,
          resource: data.resource,
          details: {
            ...data.details,
            success: data.success,
            errorMessage: data.errorMessage,
            responseTime: data.responseTime,
          } as any,
          ipAddress: data.ip,
          userAgent: data.userAgent,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  // Log security events
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await prisma.securityEvent.create({
        data: {
          type: event.type,
          severity: event.severity,
          ipAddress: event.ip,
          userAgent: event.userAgent,
          userId: event.userId || null,
          description: event.description,
          metadata: event.metadata as any,
          createdAt: new Date(),
        },
      });

      // Also log to audit log for comprehensive tracking
      await this.logActivity({
        ip: event.ip,
        userAgent: event.userAgent,
        userId: event.userId,
        action: 'security_event',
        resource: 'system',
        details: {
          type: event.type,
          severity: event.severity,
          description: event.description,
          metadata: event.metadata,
        },
        success: false,
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Analyze IP patterns for suspicious activity
  async analyzeIpActivity(ip: string, timeWindowMinutes: number = 60): Promise<{
    totalRequests: number;
    failedRequests: number;
    uniqueEndpoints: number;
    suspiciousActivity: boolean;
    riskScore: number;
  }> {
    try {
      const since = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
      
      // Get all audit logs for this IP in the time window
      const logs = await prisma.auditLog.findMany({
        where: {
          ipAddress: ip,
          createdAt: {
            gte: since,
          },
        },
        select: {
          action: true,
          resource: true,
          details: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalRequests = logs.length;
      const failedRequests = logs.filter(log => 
        log.details && 
        typeof log.details === 'object' && 
        'success' in log.details && 
        log.details.success === false
      ).length;

      const uniqueEndpoints = new Set(logs.map(log => `${log.action}:${log.resource}`)).size;
      
      // Calculate risk score based on various factors
      let riskScore = 0;
      
      // High volume of requests
      if (totalRequests > 100) riskScore += 3;
      else if (totalRequests > 50) riskScore += 2;
      else if (totalRequests > 20) riskScore += 1;
      
      // High failure rate
      const failureRate = totalRequests > 0 ? failedRequests / totalRequests : 0;
      if (failureRate > 0.5) riskScore += 4;
      else if (failureRate > 0.3) riskScore += 2;
      else if (failureRate > 0.1) riskScore += 1;
      
      // Accessing many different endpoints
      if (uniqueEndpoints > 20) riskScore += 2;
      else if (uniqueEndpoints > 10) riskScore += 1;
      
      // Check for rapid successive requests
      if (logs.length >= 2) {
        const timeDiffs = [];
        for (let i = 1; i < logs.length; i++) {
          const diff = logs[i-1].createdAt.getTime() - logs[i].createdAt.getTime();
          timeDiffs.push(diff);
        }
        const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
        if (avgTimeDiff < 1000) riskScore += 3; // Less than 1 second between requests
        else if (avgTimeDiff < 5000) riskScore += 1; // Less than 5 seconds
      }

      const suspiciousActivity = riskScore >= 5;

      return {
        totalRequests,
        failedRequests,
        uniqueEndpoints,
        suspiciousActivity,
        riskScore: Math.min(riskScore, 10), // Cap at 10
      };
    } catch (error) {
      console.error('Failed to analyze IP activity:', error);
      return {
        totalRequests: 0,
        failedRequests: 0,
        uniqueEndpoints: 0,
        suspiciousActivity: false,
        riskScore: 0,
      };
    }
  }

  // Get IP geolocation info (using a free service)
  async getIpGeolocation(ip: string): Promise<{
    country?: string;
    region?: string;
    city?: string;
    isp?: string;
    isVpn?: boolean;
  }> {
    try {
      // Skip localhost and private IPs
      if (ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return { country: 'Local', region: 'Local', city: 'Local' };
      }

      // Using ipapi.co (free tier: 1000 requests/day)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        country: data.country_name,
        region: data.region,
        city: data.city,
        isp: data.org,
        isVpn: data.connection?.type === 'vpn',
      };
    } catch (error) {
      console.error('Failed to get IP geolocation:', error);
      return {};
    }
  }

  // Get recent security events
  async getRecentSecurityEvents(limit: number = 50): Promise<Array<{
    id: string;
    type: string;
    severity: string;
    ipAddress: string;
    userAgent: string;
    description: string;
    createdAt: Date;
    metadata?: any;
  }>> {
    try {
      const events = await prisma.securityEvent.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          type: true,
          severity: true,
          ipAddress: true,
          userAgent: true,
          description: true,
          createdAt: true,
          metadata: true,
        },
      });
      
      return events;
    } catch (error) {
      console.error('Failed to get recent security events:', error);
      return [];
    }
  }

  // Get suspicious IPs in the last 24 hours
  async getSuspiciousIps(): Promise<Array<{
    ip: string;
    riskScore: number;
    totalRequests: number;
    failedRequests: number;
    lastActivity: Date;
  }>> {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      // Get all IPs with activity in the last 24 hours
      const ipActivity = await prisma.auditLog.groupBy({
        by: ['ipAddress'],
        where: {
          createdAt: {
            gte: since,
          },
          ipAddress: {
            not: null,
          },
        },
        _count: {
          id: true,
        },
        _max: {
          createdAt: true,
        },
      });

      const suspiciousIps = [];
      
      for (const activity of ipActivity) {
        if (!activity.ipAddress) continue;
        
        const analysis = await this.analyzeIpActivity(activity.ipAddress, 24 * 60);
        
        if (analysis.suspiciousActivity) {
          suspiciousIps.push({
            ip: activity.ipAddress,
            riskScore: analysis.riskScore,
            totalRequests: analysis.totalRequests,
            failedRequests: analysis.failedRequests,
            lastActivity: activity._max.createdAt!,
          });
        }
      }
      
      return suspiciousIps.sort((a, b) => b.riskScore - a.riskScore);
    } catch (error) {
      console.error('Failed to get suspicious IPs:', error);
      return [];
    }
  }
}

// Helper function to extract comprehensive request data
export function extractRequestData(request: NextRequest): {
  ip: string;
  userAgent: string;
  referer?: string;
  origin?: string;
  acceptLanguage?: string;
  acceptEncoding?: string;
} {
  // Get real IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');
  
  let ip = 'unknown';
  if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp;
  } else if (cfIp) {
    ip = cfIp;
  } else if (request.ip) {
    ip = request.ip;
  }

  return {
    ip,
    userAgent: request.headers.get('user-agent') || 'unknown',
    referer: request.headers.get('referer') || undefined,
    origin: request.headers.get('origin') || undefined,
    acceptLanguage: request.headers.get('accept-language') || undefined,
    acceptEncoding: request.headers.get('accept-encoding') || undefined,
  };
}

// Global IP tracker instance
export const ipTracker = new IpTracker();

// Middleware helper for tracking requests
export async function trackRequest(
  request: NextRequest,
  action: string,
  resource: string,
  userId?: string,
  additionalDetails?: Record<string, any>
): Promise<void> {
  const requestData = extractRequestData(request);
  
  await ipTracker.logActivity({
    ip: requestData.ip,
    userAgent: requestData.userAgent,
    userId,
    action,
    resource,
    details: {
      ...additionalDetails,
      referer: requestData.referer,
      origin: requestData.origin,
      acceptLanguage: requestData.acceptLanguage,
    },
  });
}
