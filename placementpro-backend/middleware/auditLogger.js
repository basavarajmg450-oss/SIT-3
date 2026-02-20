const auditLogs = [];

const auditLogger = (action) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      if (res.statusCode < 400) {
        const log = {
          id: Date.now().toString(),
          action,
          userId: req.user?._id,
          userEmail: req.user?.email,
          userRole: req.user?.role,
          method: req.method,
          path: req.path,
          body: sanitizeBody(req.body),
          ip: req.ip,
          timestamp: new Date().toISOString(),
          statusCode: res.statusCode,
        };
        auditLogs.unshift(log);
        if (auditLogs.length > 1000) auditLogs.splice(1000);
      }
      return originalJson(data);
    };
    next();
  };
};

const sanitizeBody = (body) => {
  if (!body) return {};
  const sensitive = ['password', 'otp', 'token', 'secret'];
  return Object.fromEntries(
    Object.entries(body).map(([k, v]) => [k, sensitive.includes(k.toLowerCase()) ? '***' : v])
  );
};

const getAuditLogs = (filters = {}) => {
  let logs = [...auditLogs];
  if (filters.userId) logs = logs.filter((l) => l.userId?.toString() === filters.userId);
  if (filters.action) logs = logs.filter((l) => l.action?.includes(filters.action));
  if (filters.from) logs = logs.filter((l) => new Date(l.timestamp) >= new Date(filters.from));
  if (filters.to) logs = logs.filter((l) => new Date(l.timestamp) <= new Date(filters.to));
  return logs.slice(0, parseInt(filters.limit) || 100);
};

module.exports = { auditLogger, getAuditLogs };
