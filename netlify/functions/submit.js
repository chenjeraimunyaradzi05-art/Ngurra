const { saveAppToFile, uploadToS3, SENDGRID, SENDGRID_FROM } = require('./helpers');
const sgMail = SENDGRID ? require('@sendgrid/mail') : null;
const uuid = () => 'app_' + Date.now() + '_' + Math.floor(Math.random()*9999);

exports.handler = async function(event, context){
  try{
    const body = JSON.parse(event.body || '{}');
    // body: { jobId, pathway, name, email, phone, identify, message, fileName, fileData }
    const id = uuid();
    let storedFile = '';

    if(body.fileKey){
      // client used presigned upload and provided S3 key
      storedFile = body.fileKey;
    } else if(body.fileData && body.fileName){
      // fileData is expected to be a data URL e.g. data:application/pdf;base64,....
      const matches = body.fileData.match(/^data:(.+);base64,(.*)$/s);
      if(matches){
        const contentType = matches[1];
        const base64 = matches[2];
        const buffer = Buffer.from(base64, 'base64');
        // prefer S3 if bucket env set
        if(process.env.S3_BUCKET){
          const key = `applications/${id}/${body.fileName}`;
          await uploadToS3({ bucket: process.env.S3_BUCKET, key, buffer, contentType });
          // store the object key (not full s3:// URI) so admin can request a signed GET URL later
          storedFile = key;
        } else {
          // fallback: store in a data-URL trimmed form in saved object
          storedFile = `data:${contentType};base64,${base64.substring(0, 200)}`; // store prefix for demo
        }
      }
    }

    const app = { id, jobId: body.jobId||'', pathway: body.pathway||'', name: body.name||'', email: body.email||'', phone: body.phone||'', identify: body.identify||'', message: body.message||'', fileName: body.fileName||'', fileRef: storedFile, submittedAt: (new Date()).toISOString() };

    // save
    await saveAppToFile(app);

    // notify via email if configured
    if(SENDGRID && process.env.SENDGRID_API_KEY){
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: process.env.RECRUITMENT_EMAIL || 'recruitment@gimbi.example',
        from: SENDGRID_FROM,
        subject: `New application: ${app.name} (${app.pathway || app.jobId})`,
        text: `New application ${app.id}\nName: ${app.name}\nEmail: ${app.email}\nPathway: ${app.pathway}\nSubmitted: ${app.submittedAt}`
      };
      try{ await sgMail.send(msg); }catch(e){ console.warn('SendGrid send failed', e.message); }
    }

    return { statusCode: 200, body: JSON.stringify({ success:true, id }) };
  }catch(err){
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'unknown' }) };
  }
}
