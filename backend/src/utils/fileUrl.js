// Builds a publicly accessible URL for an uploaded file based on the
// incoming request's protocol and host, so it works across environments.
const buildFileUrl = (req, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

module.exports = buildFileUrl;
