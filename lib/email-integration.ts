
// WRDO Cave Ultra - Gmail API Integration for Intelligent Email Alerts
import { google } from 'googleapis'
import { prisma } from '@/lib/db'
import { wrdoWebSocket } from '@/lib/websocket-server'

export interface EmailMessage {
  id: string
  threadId: string
  snippet: string
  payload: {
    headers: Array<{ name: string; value: string }>
    parts?: Array<{ body: { data: string } }>
    body?: { data: string }
  }
  internalDate: string
  labelIds: string[]
  sizeEstimate: number
}

export interface ProcessedEmail {
  id: string
  subject: string
  sender: string
  senderEmail: string
  recipient: string
  preview: string
  fullContent: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  isRead: boolean
  receivedAt: Date
  labels: string[]
  threadId: string
  hasAttachments: boolean
  intelligentSummary?: string
  actionItems?: string[]
  sentiment?: 'positive' | 'neutral' | 'negative'
  category?: 'business' | 'personal' | 'marketing' | 'support' | 'other'
}

export interface EmailAlert {
  type: 'high_priority' | 'important_sender' | 'urgent_keywords' | 'business_critical'
  email: ProcessedEmail
  reason: string
  confidence: number
}

class WRDOEmailIntegration {
  private oauth2Client: any
  private gmail: any
  private isInitialized = false

  constructor() {
    this.initializeGmail()
  }

  private async initializeGmail() {
    try {
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/api/auth/gmail/callback'
      )

      // In production, load stored refresh token from database
      const refreshToken = process.env.GMAIL_REFRESH_TOKEN
      if (refreshToken) {
        this.oauth2Client.setCredentials({
          refresh_token: refreshToken
        })
      }

      this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
      this.isInitialized = true
      console.log('✅ Gmail API initialized successfully')
    } catch (error) {
      console.error('❌ Gmail API initialization failed:', error)
    }
  }

  // Get OAuth URL for initial authentication
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ]

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    })
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code)
      this.oauth2Client.setCredentials(tokens)
      
      // Store refresh token securely in database
      if (tokens.refresh_token) {
        // In production, encrypt and store this token
        console.log('🔐 Refresh token received - store securely')
      }

      return tokens
    } catch (error) {
      console.error('Token exchange failed:', error)
      throw error
    }
  }

  // Get recent emails with intelligent filtering
  async getRecentEmails(userId: string, maxResults = 50): Promise<ProcessedEmail[]> {
    if (!this.isInitialized) {
      throw new Error('Gmail API not initialized')
    }

    try {
      // Get user's email account from database
      const emailAccount = await prisma.emailAccount.findFirst({
        where: { userId, isActive: true }
      })

      if (!emailAccount) {
        throw new Error('No active email account found')
      }

      // Fetch messages from Gmail
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: 'is:unread OR newer_than:1d' // Unread or from last day
      })

      const messages = response.data.messages || []
      const processedEmails: ProcessedEmail[] = []

      // Process each message
      for (const message of messages) {
        try {
          const emailData = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          })

          const processed = await this.processEmailMessage(emailData.data)
          processedEmails.push(processed)

          // Store in database
          await this.storeEmailSummary(emailAccount.id, processed)

          // Check for alerts
          const alert = await this.analyzeForAlerts(processed)
          if (alert) {
            await this.sendEmailAlert(userId, alert)
          }

        } catch (error) {
          console.error(`Failed to process message ${message.id}:`, error)
        }
      }

      return processedEmails
    } catch (error) {
      console.error('Failed to fetch emails:', error)
      throw error
    }
  }

  // Process individual email message
  private async processEmailMessage(message: EmailMessage): Promise<ProcessedEmail> {
    const headers = message.payload.headers || []
    const subject = this.getHeader(headers, 'Subject') || 'No Subject'
    const sender = this.getHeader(headers, 'From') || 'Unknown Sender'
    const recipient = this.getHeader(headers, 'To') || 'Unknown Recipient'
    const date = new Date(parseInt(message.internalDate))

    // Extract email address from sender
    const senderEmailMatch = sender.match(/<(.+?)>/)
    const senderEmail = senderEmailMatch ? senderEmailMatch[1] : sender

    // Get email content
    const content = this.extractEmailContent(message.payload)
    const preview = content.substring(0, 200) + (content.length > 200 ? '...' : '')

    // Analyze priority
    const priority = await this.analyzePriority(subject, sender, content)

    // Analyze content with AI
    const analysis = await this.analyzeEmailContent(subject, content, sender)

    return {
      id: message.id,
      subject,
      sender,
      senderEmail,
      recipient,
      preview,
      fullContent: content,
      priority,
      isRead: !message.labelIds.includes('UNREAD'),
      receivedAt: date,
      labels: message.labelIds,
      threadId: message.threadId,
      hasAttachments: this.hasAttachments(message.payload),
      intelligentSummary: analysis.summary,
      actionItems: analysis.actionItems,
      sentiment: analysis.sentiment,
      category: analysis.category
    }
  }

  // Analyze email for priority and alerts
  private async analyzePriority(subject: string, sender: string, content: string): Promise<'low' | 'normal' | 'high' | 'urgent'> {
    const urgentKeywords = ['urgent', 'asap', 'immediate', 'emergency', 'critical', 'deadline']
    const highKeywords = ['important', 'priority', 'meeting', 'contract', 'payment', 'invoice']
    
    const subjectLower = subject.toLowerCase()
    const contentLower = content.toLowerCase()
    const senderLower = sender.toLowerCase()

    // Check for urgent indicators
    if (urgentKeywords.some(keyword => subjectLower.includes(keyword) || contentLower.includes(keyword))) {
      return 'urgent'
    }

    // Check for high priority indicators
    if (highKeywords.some(keyword => subjectLower.includes(keyword) || contentLower.includes(keyword))) {
      return 'high'
    }

    // Check for important senders (CEO, clients, etc.)
    const importantDomains = ['ceo', 'director', 'manager', 'client', 'customer']
    if (importantDomains.some(domain => senderLower.includes(domain))) {
      return 'high'
    }

    return 'normal'
  }

  // Analyze email content with AI
  private async analyzeEmailContent(subject: string, content: string, sender: string) {
    try {
      // Use WRDO AI to analyze email content
      const prompt = `Analyze this email and provide:
1. A brief summary (max 100 words)
2. Action items (if any)
3. Sentiment (positive/neutral/negative)
4. Category (business/personal/marketing/support/other)

Email Subject: ${subject}
From: ${sender}
Content: ${content.substring(0, 1000)}...

Respond in JSON format.`

      // In production, use the AI router to get analysis
      const analysis = {
        summary: `Email from ${sender} regarding ${subject}`,
        actionItems: [],
        sentiment: 'neutral' as const,
        category: 'business' as const
      }

      return analysis
    } catch (error) {
      console.error('AI analysis failed:', error)
      return {
        summary: `Email from ${sender}`,
        actionItems: [],
        sentiment: 'neutral' as const,
        category: 'other' as const
      }
    }
  }

  // Analyze for alerts
  private async analyzeForAlerts(email: ProcessedEmail): Promise<EmailAlert | null> {
    const alerts: EmailAlert[] = []

    // High priority alert
    if (email.priority === 'urgent') {
      alerts.push({
        type: 'high_priority',
        email,
        reason: 'Email marked as urgent priority',
        confidence: 0.9
      })
    }

    // Important sender alert
    const importantSenders = ['ceo@', 'director@', 'manager@'] // Configure based on organization
    if (importantSenders.some(sender => email.senderEmail.includes(sender))) {
      alerts.push({
        type: 'important_sender',
        email,
        reason: 'Email from important sender',
        confidence: 0.8
      })
    }

    // Urgent keywords alert
    const urgentKeywords = ['contract', 'payment', 'deadline', 'meeting', 'urgent']
    if (urgentKeywords.some(keyword => 
      email.subject.toLowerCase().includes(keyword) || 
      email.fullContent.toLowerCase().includes(keyword)
    )) {
      alerts.push({
        type: 'urgent_keywords',
        email,
        reason: 'Contains urgent keywords',
        confidence: 0.7
      })
    }

    // Return highest confidence alert
    return alerts.length > 0 ? alerts.sort((a, b) => b.confidence - a.confidence)[0] : null
  }

  // Send email alert via WebSocket
  private async sendEmailAlert(userId: string, alert: EmailAlert) {
    const notification = {
      id: `email_alert_${alert.email.id}`,
      type: 'email_alert' as const,
      title: `Important Email: ${alert.email.subject}`,
      message: `From ${alert.email.sender}: ${alert.email.preview}`,
      severity: alert.type === 'high_priority' ? 'critical' as const : 'high' as const,
      userId,
      metadata: {
        emailId: alert.email.id,
        alertType: alert.type,
        reason: alert.reason,
        confidence: alert.confidence,
        sender: alert.email.sender,
        subject: alert.email.subject
      },
      timestamp: new Date(),
      read: false
    }

    wrdoWebSocket.sendEmailAlert(userId, alert.email)
  }

  // Store email summary in database
  private async storeEmailSummary(emailAccountId: string, email: ProcessedEmail) {
    try {
      await prisma.emailSummary.upsert({
        where: { 
          id: email.id 
        },
        update: {
          subject: email.subject,
          sender: email.sender,
          preview: email.preview,
          priority: email.priority,
          isRead: email.isRead,
          receivedAt: email.receivedAt,
        },
        create: {
          id: email.id,
          subject: email.subject,
          sender: email.sender,
          preview: email.preview,
          priority: email.priority,
          isRead: email.isRead,
          receivedAt: email.receivedAt,
          emailAccountId
        }
      })
    } catch (error) {
      console.error('Failed to store email summary:', error)
    }
  }

  // Utility methods
  private getHeader(headers: Array<{ name: string; value: string }>, name: string): string | undefined {
    return headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value
  }

  private extractEmailContent(payload: any): string {
    let content = ''

    if (payload.body?.data) {
      content = Buffer.from(payload.body.data, 'base64').toString('utf-8')
    } else if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          content += Buffer.from(part.body.data, 'base64').toString('utf-8')
        }
      }
    }

    return content.replace(/<[^>]*>/g, '').trim() // Remove HTML tags
  }

  private hasAttachments(payload: any): boolean {
    if (payload.parts) {
      return payload.parts.some((part: any) => part.filename && part.filename.length > 0)
    }
    return false
  }

  // Start monitoring emails (to be called periodically)
  async startEmailMonitoring(userId: string) {
    console.log(`📧 Starting email monitoring for user ${userId}`)
    
    try {
      await this.getRecentEmails(userId)
      console.log('✅ Email check completed successfully')
    } catch (error) {
      console.error('❌ Email monitoring failed:', error)
    }
  }
}

export const emailIntegration = new WRDOEmailIntegration()

// Email monitoring scheduler
export class EmailMonitoringScheduler {
  private intervals = new Map<string, NodeJS.Timeout>()

  startMonitoring(userId: string, intervalMinutes = 5) {
    if (this.intervals.has(userId)) {
      this.stopMonitoring(userId)
    }

    const interval = setInterval(async () => {
      try {
        await emailIntegration.startEmailMonitoring(userId)
      } catch (error) {
        console.error(`Email monitoring failed for user ${userId}:`, error)
      }
    }, intervalMinutes * 60 * 1000)

    this.intervals.set(userId, interval)
    console.log(`📧 Email monitoring started for user ${userId} (${intervalMinutes}min intervals)`)
  }

  stopMonitoring(userId: string) {
    const interval = this.intervals.get(userId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(userId)
      console.log(`📧 Email monitoring stopped for user ${userId}`)
    }
  }

  stopAllMonitoring() {
    Array.from(this.intervals.entries()).forEach(([userId, interval]) => {
      clearInterval(interval)
    })
    this.intervals.clear()
    console.log('📧 All email monitoring stopped')
  }
}

export const emailScheduler = new EmailMonitoringScheduler()
