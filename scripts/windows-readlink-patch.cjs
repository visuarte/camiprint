/*
 * Workaround for Windows environments where fs.readlink* may throw EISDIR
 * for regular files. Next.js build checks symlinks and expects EINVAL/UNKNOWN
 * for non-links; this patch normalizes EISDIR to EINVAL.
 */
if (process.platform === 'win32') {
  const fs = require('fs');

  const normalizeError = (error) => {
    if (error && error.code === 'EISDIR') {
      const normalized = new Error(error.message.replace('EISDIR', 'EINVAL'));
      normalized.code = 'EINVAL';
      normalized.errno = -4071;
      normalized.syscall = error.syscall;
      normalized.path = error.path;
      return normalized;
    }
    return error;
  };

  const originalReadlinkSync = fs.readlinkSync.bind(fs);
  fs.readlinkSync = (...args) => {
    try {
      return originalReadlinkSync(...args);
    } catch (error) {
      throw normalizeError(error);
    }
  };

  const originalReadlink = fs.readlink.bind(fs);
  fs.readlink = (...args) => {
    const callback = args[args.length - 1];
    if (typeof callback !== 'function') {
      return originalReadlink(...args);
    }
    const wrapped = (error, linkString) => callback(normalizeError(error), linkString);
    const callArgs = [...args.slice(0, -1), wrapped];
    return originalReadlink(...callArgs);
  };

  if (fs.promises?.readlink) {
    const originalPromisesReadlink = fs.promises.readlink.bind(fs.promises);
    fs.promises.readlink = async (...args) => {
      try {
        return await originalPromisesReadlink(...args);
      } catch (error) {
        throw normalizeError(error);
      }
    };
  }
}