// Vercel Serverless Function to safely return Coze token from environment
// Usage: set COZE_TOKEN in Vercel Environment Variables (Production/Preview/Development as needed)
export default function handler(req, res) {
  const token = process.env.COZE_TOKEN;
  if(!token){
    res.statusCode = 500;
    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({ error: 'COZE_TOKEN not configured on server' }));
    return;
  }
  // Return plain text token (client will call this endpoint to obtain token)
  res.setHeader('Content-Type','text/plain');
  res.end(token);
}
