const AWS = require('aws-sdk');

exports.handler = async function(event){
  try{
    if(event.httpMethod !== 'POST') return { statusCode:405, body: 'Method not allowed' };
    const body = JSON.parse(event.body || '{}');
    const { fileName, contentType, id } = body;
    if(!fileName || !contentType) return { statusCode:400, body: JSON.stringify({ error:'Missing fileName or contentType' }) };

    const bucket = process.env.S3_BUCKET;
    if(!bucket) return { statusCode:400, body: JSON.stringify({ error:'S3_BUCKET not configured' }) };

    const s3 = new AWS.S3();
    // key: applications/<id or timestamp>/<filename>
    const key = `applications/${id || Date.now()}/${fileName.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
    const params = { Bucket: bucket, Key: key, ContentType: contentType, ACL: 'private' };
    const uploadUrl = await s3.getSignedUrlPromise('putObject', { ...params, Expires: 300 });
    return { statusCode:200, body: JSON.stringify({ uploadUrl, key }) };
  }catch(e){
    console.error(e);
    return { statusCode:500, body: JSON.stringify({ error: e.message }) };
  }
}
