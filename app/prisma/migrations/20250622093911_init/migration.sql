-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "response" TEXT,
    "metadata" JSONB,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'gmail',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastChecked" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "EmailAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "preview" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "receivedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailAccountId" TEXT NOT NULL,
    CONSTRAINT "EmailSummary_emailAccountId_fkey" FOREIGN KEY ("emailAccountId") REFERENCES "EmailAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "integration_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "apiKey" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "integration_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "analytics_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "social_media_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "content" TEXT,
    "mediaUrl" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "engagement" REAL NOT NULL DEFAULT 0,
    "publishedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ai_configurations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "apiKey" TEXT,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "costPerToken" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "ai_configurations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deep_agent_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "briefing" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "estimatedCost" REAL,
    "actualCost" REAL,
    "result" JSONB,
    "approvedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "deep_agent_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mailchimp_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listId" TEXT,
    "campaignId" TEXT,
    "subscribers" INTEGER NOT NULL DEFAULT 0,
    "openRate" REAL NOT NULL DEFAULT 0,
    "clickRate" REAL NOT NULL DEFAULT 0,
    "bounceRate" REAL NOT NULL DEFAULT 0,
    "unsubscribeRate" REAL NOT NULL DEFAULT 0,
    "date" DATETIME NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_role_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    CONSTRAINT "user_role_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_role_assignments_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "user_roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "api_key_management" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service" TEXT NOT NULL,
    "keyName" TEXT NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" DATETIME,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "api_key_management_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "userId" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "security_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pattern_recognition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patternType" TEXT NOT NULL,
    "dataSource" TEXT NOT NULL,
    "pattern" JSONB NOT NULL,
    "confidence" REAL NOT NULL,
    "frequency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastDetected" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pattern_anomalies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patternId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "detectedData" JSONB NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT,
    "actionTaken" TEXT,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pattern_anomalies_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "pattern_recognition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contextual_learning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "learningData" JSONB NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0.5,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contextual_learning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT,
    "mimeType" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "knowledge_graph" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "knowledge_graph_relations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromEntityId" TEXT NOT NULL,
    "toEntityId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "strength" REAL NOT NULL DEFAULT 1.0,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "knowledge_graph_relations_fromEntityId_fkey" FOREIGN KEY ("fromEntityId") REFERENCES "knowledge_graph" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "knowledge_graph_relations_toEntityId_fkey" FOREIGN KEY ("toEntityId") REFERENCES "knowledge_graph" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "autonomous_agents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "description" TEXT,
    "goals" JSONB NOT NULL,
    "capabilities" JSONB NOT NULL,
    "constraints" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastExecution" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "agent_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "input" JSONB NOT NULL,
    "output" JSONB,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agent_tasks_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "autonomous_agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "predictive_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "algorithm" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "trainingData" JSONB,
    "accuracy" REAL,
    "lastTrained" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "model_predictions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "predictionType" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "confidence" REAL NOT NULL,
    "actualValue" JSONB,
    "isAccurate" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "model_predictions_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "predictive_models" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "competitor_intelligence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competitorName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "website" TEXT,
    "socialMedia" JSONB,
    "keyMetrics" JSONB NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "competitor_insights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competitorId" TEXT NOT NULL,
    "insightType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0.8,
    "actionRequired" BOOLEAN NOT NULL DEFAULT false,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "competitor_insights_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "competitor_intelligence" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "compliance_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "severity" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "compliance_violations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleId" TEXT NOT NULL,
    "violationType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "resolution" TEXT,
    CONSTRAINT "compliance_violations_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "compliance_rules" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "security_threats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threatType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT,
    "targetResource" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mitigatedAt" DATETIME,
    "resolution" TEXT
);

-- CreateTable
CREATE TABLE "impact_assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "changeType" TEXT NOT NULL,
    "changeId" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "impactAreas" JSONB NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "mitigation" JSONB,
    "recommendations" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessedBy" TEXT
);

-- CreateTable
CREATE TABLE "change_management" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "changeTitle" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'planned',
    "plannedDate" DATETIME,
    "implementedDate" DATETIME,
    "rollbackPlan" JSONB,
    "affectedSystems" JSONB NOT NULL,
    "stakeholders" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ip_protection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetType" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "description" TEXT,
    "registrationNumber" TEXT,
    "status" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "expiryDate" DATETIME,
    "renewalDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ip_violations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ipAssetId" TEXT NOT NULL,
    "violationType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'detected',
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "resolution" TEXT,
    CONSTRAINT "ip_violations_ipAssetId_fkey" FOREIGN KEY ("ipAssetId") REFERENCES "ip_protection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "EmailAccount_userId_email_key" ON "EmailAccount"("userId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "integration_settings_userId_platform_key" ON "integration_settings"("userId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "social_media_posts_platform_postId_key" ON "social_media_posts"("platform", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_configurations_userId_provider_model_key" ON "ai_configurations"("userId", "provider", "model");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_name_key" ON "user_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_assignments_userId_roleId_key" ON "user_role_assignments"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "api_key_management_userId_service_keyName_key" ON "api_key_management"("userId", "service", "keyName");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_category_key_key" ON "system_settings"("category", "key");

-- CreateIndex
CREATE UNIQUE INDEX "contextual_learning_userId_context_key" ON "contextual_learning"("userId", "context");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_graph_entityType_entityId_key" ON "knowledge_graph"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_graph_relations_fromEntityId_toEntityId_relationType_key" ON "knowledge_graph_relations"("fromEntityId", "toEntityId", "relationType");

-- CreateIndex
CREATE UNIQUE INDEX "competitor_intelligence_competitorName_location_key" ON "competitor_intelligence"("competitorName", "location");
