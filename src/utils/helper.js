function convertUpdateBody(body, keys) {
  const newBody = {};
  keys.forEach(k => {
    if (body[k]) {
      newBody[k] = body[k];
    }
  });
  return newBody;
}

function convertSortQuery(sortQuery) {
  const sort = {};
  if (sortQuery) {
    const keys = sortQuery.split(',');
    keys.forEach(key => {
      if (key.includes('-')) {
        sort[key.replace('-', '')] = -1;
      } else {
        sort[key] = 1;
      }
    });
  }
  return sort;
}

function convertPagination(query, count) {
  if (count === 0) {
    return { page: 1, pageSize: 10, pages: 1 };
  }
  let { pageSize, page } = query;
  pageSize = parseInt(query.pageSize) || 10;
  page = parseInt(query.page) || 1;
  if (page < 1) {
    page = 1;
  }
  const pages = Math.ceil(count / pageSize);
  if (page > pages) {
    page = pages;
  }
  return { page, pageSize, pages };
}

function convertQuery(query, total) {
  const pagination = convertPagination(query, total);
  const sort = convertSortQuery(query.sort);
  const search = query.q;
  return { pagination, sort, search };
}

function extractS3FolderName(baseUrl) {
  const array = baseUrl.split('/');
  return array[array.length - 1];
}

function extractS3ObjectKey(baseUrl, url) {
  const folderName = extractS3FolderName(baseUrl);
  const array = url.split('/');
  return `${folderName}/${array[array.length - 1]}`;
}

function formatResponse(res, payload, code = 200) {
  const response = { code };
  if (code < 400) {
    if (payload.data) {
      response.data = payload.data;
    } else {
      response.data = payload;
    }
  } else {
    response.error = payload;
  }
  if (payload.pagination) {
    response.pagination = payload.pagination;
  }
  return res.status(code).send(response);
}

module.exports = {
  convertUpdateBody,
  extractS3FolderName,
  extractS3ObjectKey,
  convertQuery,
  formatResponse
};
