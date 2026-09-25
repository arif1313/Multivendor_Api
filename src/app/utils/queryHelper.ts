export type TPagination = {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
};

export const buildPagination = (query: Record<string, unknown>): TPagination => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const sortBy = (query.sortBy as string) || "createdAt";
  const sortOrder = (query.sortOrder as string) === "asc" ? 1 : -1;

  return { page, limit, skip: (page - 1) * limit, sort: { [sortBy]: sortOrder } };
};

export const buildMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPage: Math.ceil(total / limit) || 0,
});
