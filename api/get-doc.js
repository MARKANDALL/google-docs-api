const { google } = require('googleapis');

module.exports = async (req, res) => {
  const { docId } = req.query;

  if (!docId) {
    return res.status(400).json({ error: 'Missing docId parameter.' });
  }

  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/documents.readonly'],
  });

  const client = await auth.getClient();
  const docs = google.docs({ version: 'v1', auth: client });

  try {
    const doc = await docs.documents.get({ documentId: docId });
    const content = doc.data.body.content;

    let text = '';
    content.forEach(element => {
      if (element.paragraph) {
        element.paragraph.elements.forEach(e => {
          if (e.textRun) {
            text += e.textRun.content;
          }
        });
      }
    });

    res.status(200).json({ content: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
