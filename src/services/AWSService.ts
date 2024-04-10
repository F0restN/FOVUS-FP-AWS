import { useState } from 'react';
import {
  ListObjectsCommand,
  ListObjectsCommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { nanoid } from 'nanoid';
import { BUCKET_NAME, CURRENT_REGION, TABLE_NAME } from '../env';

let client: S3Client;
let dbClient: DynamoDBClient;
let docClient: DynamoDBDocumentClient;

function auth(token: string | number | readonly string[] | undefined) {
  try {
    const identityPoolId = atob(token as string);
    if (token === 'dXMtZWFzdC0yOjllYzgxNTQyLWJmZDgtNDFhZS04MjI5LWNmNTUyODlhNWFjNg==') {
      client = new S3Client({
        region: CURRENT_REGION,
        credentials: fromCognitoIdentityPool({
          clientConfig: { region: CURRENT_REGION },
          identityPoolId: identityPoolId,
        }),
      });
      dbClient = new DynamoDBClient({
        region: CURRENT_REGION,
        credentials: fromCognitoIdentityPool({
          clientConfig: { region: CURRENT_REGION },
          identityPoolId: identityPoolId,
        }),
      });
      docClient = DynamoDBDocumentClient.from(dbClient);
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
  return true;
}

/**
 * Description placeholder
 * @date 4/6/2024 - 12:33:15 AM
 *
 * @async
 * @returns {Array[Object]} - {Contents: Array[Object]
 */
async function getAWSListObjects() {
  const command = new ListObjectsCommand({ Bucket: BUCKET_NAME });
  return client.send(command).then(({ Contents }) => Contents || []);
}

interface uploadConfigOptions {
  Key: string;
  Body: string | Blob;
}

// TODO: improve it to a hook
/**
 *
 * @param {uploadConfigOptions} config
 * @returns
 */
async function uploadFile2AWS(config: uploadConfigOptions) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: config.Key,
    Body: config.Body,
  });
  return await client.send(command);
}

async function insert2DynamoDB(Item: uploadedFileClass) {
  const command = new PutCommand({
    TableName: `${TABLE_NAME}`,
    Item: { ...Item, id: nanoid() },
  });
  return await docClient.send(command);
}

export { getAWSListObjects, uploadFile2AWS, insert2DynamoDB, auth };
