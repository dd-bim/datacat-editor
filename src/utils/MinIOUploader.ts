/**
 * Minimale MinIO Upload-only Implementierung
 */

export interface MinIOUploadConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

export class MinIOUploader {
  private config: MinIOUploadConfig;
  private baseUrl: string;

  constructor(config: MinIOUploadConfig) {
    this.config = config;
    const protocol = config.useSSL ? 'https' : 'http';
    this.baseUrl = config.useSSL ? `${protocol}://${config.endpoint}` : `${protocol}://${config.endpoint}:${config.port}`;

    
    console.log(`MinIO Upload configured: ${this.baseUrl}/${config.bucketName}`);
  }

  /**
   * Browser-kompatible SHA256 Hash-Funktion
   */
  private async sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Browser-kompatible HMAC-SHA256
   */
  private async hmacSHA256(key: string | Uint8Array, message: string): Promise<Uint8Array> {
    const keyBuffer = typeof key === 'string' ? new TextEncoder().encode(key) : new Uint8Array(key);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
    return new Uint8Array(signature);
  }

  /**
   * Prüft ob Bucket existiert und erstellt ihn falls nötig
   */
  private async ensureBucketExists(): Promise<boolean> {
    try {
      // HEAD Request auf Bucket
      const bucketPath = `/${this.config.bucketName}`;
      const bucketUrl = `${this.baseUrl}${bucketPath}`;
      const headHeaders = await this.createAWSV4Headers('HEAD', bucketPath);
      
      const headResponse = await fetch(bucketUrl, {
        method: 'HEAD',
        headers: headHeaders,
        signal: AbortSignal.timeout(3000)
      });

      if (headResponse.ok) {
        console.log(`✅ Bucket ${this.config.bucketName} exists`);
        return true;
      }

      // Bucket existiert nicht (404) - versuche zu erstellen
      if (headResponse.status === 404) {
        console.log(`📦 Creating bucket ${this.config.bucketName}...`);
        const putHeaders = await this.createAWSV4Headers('PUT', bucketPath);
        
        const putResponse = await fetch(bucketUrl, {
          method: 'PUT',
          headers: putHeaders,
          signal: AbortSignal.timeout(3000)
        });

        if (putResponse.ok) {
          console.log(`✅ Bucket ${this.config.bucketName} created successfully`);
          return true;
        } else {
          const errorText = await putResponse.text().catch(() => 'Unknown error');
          console.error(`❌ Failed to create bucket: ${putResponse.status} - ${errorText}`);
          return false;
        }
      }

      console.warn(`⚠️ Unexpected bucket status: ${headResponse.status}`);
      return false;
    } catch (error) {
      console.error(`❌ Bucket check/creation failed:`, error);
      return false;
    }
  }

  /**
   * AWS Signature V4 für MinIO
   */
  private async createAWSV4Headers(method: string, path: string, payload: string = ''): Promise<Record<string, string>> {
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substr(0, 8);
    
    const region = 'us-east-1';
    const service = 's3';
    const host = this.config.useSSL 
      ? this.config.endpoint 
      : `${this.config.endpoint}:${this.config.port}`;
    
    // Headers für Signature
    const headers = {
      'host': host,
      'x-amz-content-sha256': await this.sha256(payload),
      'x-amz-date': amzDate,
    };
    
    const signedHeaders = Object.keys(headers).sort().join(';');
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key}:${headers[key as keyof typeof headers]}\n`)
      .join('');
    
    // Canonical Request
    const canonicalUri = encodeURIComponent(path).replace(/%2F/g, '/');
    const canonicalRequest = [
      method,
      canonicalUri,
      '', // Query String
      canonicalHeaders,
      signedHeaders,
      headers['x-amz-content-sha256']
    ].join('\n');
    
    // String to Sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      await this.sha256(canonicalRequest)
    ].join('\n');
    
    // Signature berechnen
    const kDate = await this.hmacSHA256(`AWS4${this.config.secretKey}`, dateStamp);
    const kRegion = await this.hmacSHA256(kDate, region);
    const kService = await this.hmacSHA256(kRegion, service);
    const kSigning = await this.hmacSHA256(kService, 'aws4_request');
    const signatureBuffer = await this.hmacSHA256(kSigning, stringToSign);
    const signature = Array.from(signatureBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Return Headers
    return {
      'Authorization': `${algorithm} Credential=${this.config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      'X-Amz-Date': amzDate,
      'X-Amz-Content-Sha256': headers['x-amz-content-sha256'],
      'Host': host,
    };
  }

async uploadIDSFile(filename: string, xmlContent: string): Promise<void> {
    // ✅ WICHTIG: XML-Content NIEMALS modifizieren!
    const originalContent = xmlContent;
    
    // Stelle sicher, dass der Bucket existiert
    const bucketReady = await this.ensureBucketExists();
    if (!bucketReady) {
      console.warn(`⚠️ Bucket not available - skipping upload for ${filename}`);
      return;
    }
    
    const path = `/${this.config.bucketName}/${filename}`;
    const url = `${this.baseUrl}${path}`;
    
    try {
      // AWS V4 Signature für den ORIGINAL content
      const awsHeaders = await this.createAWSV4Headers('PUT', path, originalContent);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/xml',
          'Content-Length': originalContent.length.toString(),
          ...awsHeaders,
        },
        body: originalContent, // ✅ IMMER original content verwenden!
        mode: 'cors',
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        console.log(`✅ File uploaded successfully: ${filename}`);
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ Upload failed: ${response.status} - ${errorText}`);
      }
      
    } catch (error) {
      console.error(`❌ Upload error for ${filename}:`, error);
      // Kein throw - graceful failure
    }
  }
}

/**
 * Hilfsfunktion um Runtime-Konfiguration zu laden
 */
function getRuntimeConfig() {
  // Fallback auf import.meta.env wenn window.ENV_CONFIG nicht verfügbar ist (Development)
  const runtimeConfig = window?.ENV_CONFIG;
  
  return {
    endpoint: runtimeConfig?.MINIO_ENDPOINT || import.meta.env.VITE_MINIO_ENDPOINT || 'localhost',
    port: parseInt(runtimeConfig?.MINIO_PORT || import.meta.env.VITE_MINIO_PORT || '9000'),
    useSSL: (runtimeConfig?.MINIO_USE_SSL || import.meta.env.VITE_MINIO_USE_SSL) === 'true',
    bucketName: runtimeConfig?.MINIO_BUCKET_NAME || import.meta.env.VITE_MINIO_BUCKET_NAME,
    accessKey: runtimeConfig?.MINIO_ACCESS_KEY || import.meta.env.VITE_MINIO_ACCESS_KEY,
    secretKey: runtimeConfig?.MINIO_SECRET_KEY || import.meta.env.VITE_MINIO_SECRET_KEY,
  };
}

/**
 * Factory-Funktion für MinIO Uploader
 */
export function createMinIOUploader(): MinIOUploader {
  const runtimeConfig = getRuntimeConfig();

  if (!runtimeConfig.accessKey || !runtimeConfig.secretKey) {
    console.warn('⚠️ MinIO credentials missing - uploads will be skipped');
  }

  // console.log(`🔧 MinIO Config loaded from: ${window?.ENV_CONFIG ? 'Runtime (env-config.js)' : 'Build-time (import.meta.env)'}`);
  // console.log(`📍 MinIO Endpoint: ${runtimeConfig.endpoint}:${runtimeConfig.port} (SSL: ${runtimeConfig.useSSL})`);
  // console.log(`🗃️ MinIO Bucket: ${runtimeConfig.bucketName}`);

  const config: MinIOUploadConfig = {
    endpoint: runtimeConfig.endpoint,
    port: runtimeConfig.port,
    useSSL: runtimeConfig.useSSL,
    bucketName: runtimeConfig.bucketName,
    accessKey: runtimeConfig.accessKey || 'dummy',
    secretKey: runtimeConfig.secretKey || 'dummy'
  };

  return new MinIOUploader(config);
}