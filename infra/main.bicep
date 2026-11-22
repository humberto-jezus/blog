@description('Região Azure onde os recursos serão provisionados')
param location string = resourceGroup().location

@description('Prefixo curto único para nomear os recursos (apenas letras minúsculas e números, 3-12 chars)')
@minLength(3)
@maxLength(12)
param appPrefix string = 'hjezusblog'

@description('Imagem Docker publicada no GitHub Container Registry (ex: ghcr.io/seu-usuario/seu-repo:latest)')
param containerImage string

@description('E-mail do administrador do blog')
param adminEmail string = 'humbertojezus@gmail.com'

@description('Nome do container privado no Blob Storage')
param blobContainerName string = 'blog-data'

// Unique suffix for globally unique resource names (Storage & Key Vault)
var uniqueSuffix = take(uniqueString(resourceGroup().id, appPrefix), 6)
var storageAccountName = toLower('${take(appPrefix, 14)}${uniqueSuffix}st')
var keyVaultName = toLower('${take(appPrefix, 14)}-${uniqueSuffix}-kv')
var identityName = '${appPrefix}-uami'
var logAnalyticsName = '${appPrefix}-law'
var acaEnvName = '${appPrefix}-env'
var acaAppName = '${appPrefix}-app'

// Built-in Azure RBAC Role Definition IDs
var keyVaultSecretsUserRoleId = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  '4633458b-17de-408a-b874-0445c86b69e6'
)
var storageBlobDataContributorRoleId = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
)

// 1. User-Assigned Managed Identity (Zero-Trust identity for ACA)
resource uami 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
}

// 2. Log Analytics Workspace (Observability & KQL Logs)
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// 3. Azure Key Vault (RBAC-only, Soft Delete, No Access Policies)
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    publicNetworkAccess: 'Enabled'
  }
}

// Grant Managed Identity read-only access to Key Vault Secrets
resource kvRbac 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, uami.id, keyVaultSecretsUserRoleId)
  scope: keyVault
  properties: {
    roleDefinitionId: keyVaultSecretsUserRoleId
    principalId: uami.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// 4. Hardened Azure Storage Account (ZERO Shared Keys, ZERO Public Blob Access, TLS 1.2+)
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: false
    defaultToOAuthAuthentication: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    deleteRetentionPolicy: {
      enabled: true
      days: 14
    }
  }
}

resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: blobContainerName
  properties: {
    publicAccess: 'None'
  }
}

// Grant Managed Identity Storage Blob Data Contributor on the private container
resource storageRbac 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(blobContainer.id, uami.id, storageBlobDataContributorRoleId)
  scope: blobContainer
  properties: {
    roleDefinitionId: storageBlobDataContributorRoleId
    principalId: uami.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// 5. Azure Container Apps Environment (Consumption Free Grant)
resource acaEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: acaEnvName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// 6. Azure Container App (Scale-to-Zero, Key Vault Secrets via UAMI, Blob Storage via UAMI)
resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: acaAppName
  location: location
  dependsOn: [
    kvRbac
    storageRbac
  ]
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${uami.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: acaEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
        allowInsecure: false
      }
      secrets: [
        {
          name: 'blog-admin-password'
          keyVaultUrl: '${keyVault.properties.vaultUri}secrets/blog-admin-password'
          identity: uami.id
        }
        {
          name: 'blog-session-secret'
          keyVaultUrl: '${keyVault.properties.vaultUri}secrets/blog-session-secret'
          identity: uami.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'blog'
          image: containerImage
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '3000'
            }
            {
              name: 'AZURE_CLIENT_ID'
              value: uami.properties.clientId
            }
            {
              name: 'AZURE_STORAGE_ACCOUNT_URL'
              value: storageAccount.properties.primaryEndpoints.blob
            }
            {
              name: 'AZURE_STORAGE_CONTAINER'
              value: blobContainerName
            }
            {
              name: 'BLOG_ADMIN_EMAIL'
              value: adminEmail
            }
            {
              name: 'BLOG_ADMIN_PASSWORD'
              secretRef: 'blog-admin-password'
            }
            {
              name: 'BLOG_SESSION_SECRET'
              secretRef: 'blog-session-secret'
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/healthz'
                port: 3000
              }
              initialDelaySeconds: 10
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/readyz'
                port: 3000
              }
              initialDelaySeconds: 5
              periodSeconds: 10
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

output appUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output keyVaultName string = keyVault.name
output storageAccountName string = storageAccount.name
output managedIdentityClientId string = uami.properties.clientId
output containerAppName string = containerApp.name
