import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const provider = searchParams.get('provider') || 'github'
  
  if (!code) {
    return new NextResponse('Missing code', { status: 400 })
  }

  // Render an HTML page that will postMessage back to the opener and close itself
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>Authenticating...</title></head>
    <body>
      <script>
        if (window.opener) {
          window.opener.postMessage({ type: 'oauth-code', provider: '${provider}', code: '${code}' }, '*');
          window.close();
        } else {
          document.body.innerHTML = 'Authentication successful! You can close this window.';
        }
      </script>
    </body>
    </html>
  `;
  
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}
