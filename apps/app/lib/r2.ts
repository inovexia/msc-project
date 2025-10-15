import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getAwsSignedUrl } from "@aws-sdk/s3-request-presigner";

// Validate R2 configuration
const validateR2Config = () => {
  const requiredEnvVars = {
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required R2 environment variables: ${missingVars.join(', ')}`);
  }

  return requiredEnvVars as Record<string, string>;
};

// Create R2 client with validation
export const createR2Client = () => {
  try {
    const config = validateR2Config();
    
    return new S3Client({
      region: "auto",
      endpoint: config.R2_ENDPOINT,
      credentials: {
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      },
    });
  } catch (error) {
    console.error("R2 configuration error:", error);
    throw error;
  }
};

// Export r2 client with lazy initialization
let r2Client: S3Client | null = null;

export const r2 = new Proxy({} as S3Client, {
  get(target, prop) {
    if (!r2Client) {
      r2Client = createR2Client();
    }
    const value = (r2Client as any)[prop];
    return typeof value === 'function' ? value.bind(r2Client) : value;
  }
});

export async function uploadToR2(bucket: string, key: string, body: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await r2.send(command);
  return `r2://${bucket}/${key}`;
}

export async function getSignedUrl(bucket: string, key: string, expiresIn = 60 * 5) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getAwsSignedUrl(r2, command, { expiresIn });
  return url;
}
