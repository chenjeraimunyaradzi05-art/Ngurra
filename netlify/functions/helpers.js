const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const SENDGRID = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM || 'noreply@gimbi.example';

const DATA_FILE = path.resolve(__dirname, '..', '..', 'data', 'applications.json');
// optional DynamoDB table name (set in env) for production use
const DDB_TABLE = process.env.DYNAMODB_TABLE || '';

function ensureDataFolder(){
  const d = path.dirname(DATA_FILE);
  if(!fs.existsSync(d)) fs.mkdirSync(d, {recursive:true});
  if(!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

async function saveAppToFile(app){
  ensureDataFolder();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const arr = JSON.parse(raw || '[]');
  arr.push(app);
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
  return app;
}

// DynamoDB helpers (if DDB_TABLE configured)
async function saveAppToDDB(app){
  const AWS = require('aws-sdk');
  const ddb = new AWS.DynamoDB.DocumentClient();
  const params = { TableName: DDB_TABLE, Item: app };
  await ddb.put(params).promise();
  return app;
}

async function getAllAppsFromDDB(){
  const AWS = require('aws-sdk');
  const ddb = new AWS.DynamoDB.DocumentClient();
  const params = { TableName: DDB_TABLE };
  const data = await ddb.scan(params).promise();
  return data.Items || [];
}

async function deleteAppFromDDB(id){
  const AWS = require('aws-sdk');
  const ddb = new AWS.DynamoDB.DocumentClient();
  const params = { TableName: DDB_TABLE, Key: { id } };
  await ddb.delete(params).promise();
  return true;
}

async function getAllAppsFromFile(){
  if(DDB_TABLE){
    return await getAllAppsFromDDB();
  }
  ensureDataFolder();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw || '[]');
}

async function deleteAppFromFile(id){
  if(DDB_TABLE){
    return await deleteAppFromDDB(id);
  }
  ensureDataFolder();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const arr = JSON.parse(raw || '[]').filter(a=>a.id !== id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
  return true;
}

async function uploadToS3({bucket, key, buffer, contentType}){
  // this helper uses AWS S3 — requires AWS_* env vars when deployed
  if(!bucket) throw new Error('Missing S3 bucket');
  const s3 = new AWS.S3();
  await s3.putObject({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType, ACL: 'private' }).promise();
  return `s3://${bucket}/${key}`;
}

module.exports = { saveAppToFile, getAllAppsFromFile, deleteAppFromFile, uploadToS3, SENDGRID, SENDGRID_FROM };
