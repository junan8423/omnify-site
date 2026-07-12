export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Secret');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    var secret = process.env.NOTICE_ADMIN_SECRET;
    var owner = process.env.GITHUB_REPO_OWNER || 'junan8423';
    var repo = process.env.GITHUB_REPO_NAME || 'omnify-site';
    var branch = process.env.GITHUB_REPO_BRANCH || 'main';
    var token = process.env.GITHUB_TOKEN;
    var filePath = 'data/notices.json';

    if (req.method === 'GET') {
        try {
            if (token) {
                var ghRes = await fetch(
                    'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + filePath + '?ref=' + branch,
                    {
                        headers: {
                            Authorization: 'Bearer ' + token,
                            Accept: 'application/vnd.github+json',
                            'X-GitHub-Api-Version': '2022-11-28'
                        }
                    }
                );
                if (ghRes.ok) {
                    var ghData = await ghRes.json();
                    var decoded = Buffer.from(ghData.content.replace(/\n/g, ''), 'base64').toString('utf8');
                    return res.status(200).json(JSON.parse(decoded));
                }
            }
        } catch (e) {
            /* fall through to static */
        }
        return res.status(200).json({ source: 'static', notices: null });
    }

    if (req.method === 'POST') {
        var body = req.body || {};
        if (body.action === 'verify') {
            if (!secret) {
                return res.status(503).json({ ok: false, error: 'NOTICE_ADMIN_SECRET not configured' });
            }
            if (body.password === secret) {
                return res.status(200).json({ ok: true });
            }
            return res.status(401).json({ ok: false, error: 'Invalid password' });
        }
        return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'PUT') {
        if (!secret || req.headers['x-admin-secret'] !== secret) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!token) {
            return res.status(503).json({ error: 'GITHUB_TOKEN not configured on server' });
        }

        var payload = req.body;
        if (!payload || !Array.isArray(payload.notices)) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        try {
            var getRes = await fetch(
                'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + filePath + '?ref=' + branch,
                {
                    headers: {
                        Authorization: 'Bearer ' + token,
                        Accept: 'application/vnd.github+json',
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                }
            );
            if (!getRes.ok) {
                return res.status(502).json({ error: 'Failed to read current notices file' });
            }
            var current = await getRes.json();
            var jsonStr = JSON.stringify(payload, null, 2) + '\n';
            var putRes = await fetch(
                'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + filePath,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: 'Bearer ' + token,
                        Accept: 'application/vnd.github+json',
                        'Content-Type': 'application/json',
                        'X-GitHub-Api-Version': '2022-11-28'
                    },
                    body: JSON.stringify({
                        message: 'Update notices via Omnify admin',
                        content: Buffer.from(jsonStr, 'utf8').toString('base64'),
                        sha: current.sha,
                        branch: branch
                    })
                }
            );
            if (!putRes.ok) {
                var errText = await putRes.text();
                return res.status(502).json({ error: 'GitHub save failed', detail: errText });
            }
            return res.status(200).json({ ok: true });
        } catch (err) {
            return res.status(500).json({ error: err.message || 'Save failed' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
