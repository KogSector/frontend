import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const provider = searchParams.get('provider') || searchParams.get('state')?.split(':')[0] || 'github'
  
  // Sanitize inputs to prevent XSS in the inline script
  const sanitize = (str: string | null): string => {
    if (!str) return '';
    return str.replace(/[<>"'&\\]/g, (c) => {
      const map: Record<string, string> = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;', '\\': '\\\\' };
      return map[c] || c;
    });
  }

  if (error) {
    const safeError = sanitize(errorDescription || error)
    const safeProvider = sanitize(provider)
    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Authentication Error</title></head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'oauth-error', provider: '${safeProvider}', error: '${safeError}' }, '*');
            window.close();
          } else {
            document.body.innerHTML = 'Authentication failed: ${safeError}. You can close this window.';
          }
        </script>
      </body>
      </html>
    `;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  }

  const installationId = searchParams.get('installation_id')

  if (!code && !installationId) {
    return new NextResponse('Missing authorization code or installation id', { status: 400 })
  }

  const safeProvider = sanitize(provider)
  const safeCode = sanitize(code)
  const safeInstallationId = sanitize(installationId)

  const payload = installationId 
    ? `{ type: 'oauth-code', provider: '${safeProvider}', installation_id: '${safeInstallationId}' }`
    : `{ type: 'oauth-code', provider: '${safeProvider}', code: '${safeCode}' }`;

  // Render an HTML page that will postMessage back to the opener and close itself
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>Authenticating...</title></head>
    <body>
      <p style="font-family: sans-serif; text-align: center; margin-top: 40px;">Connecting your account...</p>
      <script>
        if (window.opener) {
          window.opener.postMessage(${payload}, '*');
          setTimeout(function() { window.close(); }, 500);
        } else {
          document.body.innerHTML = '<p style="font-family: sans-serif; text-align: center; margin-top: 40px;">Authentication successful! You can close this window.</p>';
        }
      </script>
    </body>
    </html>
  `;
  
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}
