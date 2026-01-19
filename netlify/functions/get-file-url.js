const AWS = require('aws-sdk');

exports.handler = async function(event){
  try{
    if(event.httpMethod !== 'POST') return { statusCode:405, body: 'Method not allowed' };
    const body = JSON.parse(event.body || '{}');
    const { key } = body;
    if(!key) return { statusCode:400, body: JSON.stringify({ error:'Missing key' }) };

    const bucket = process.env.S3_BUCKET;
    if(!bucket) return { statusCode:400, body: JSON.stringify({ error:'S3_BUCKET not configured' }) };

    const s3 = new AWS.S3();
    const params = { Bucket: bucket, Key: key, Expires: 300 };
    const url = await s3.getSignedUrlPromise('getObject', params);
    return { statusCode:200, body: JSON.stringify({ url }) };
  }catch(e){
    console.error(e);
    return { statusCode:500, body: JSON.stringify({ error: e.message }) };
  }
}
