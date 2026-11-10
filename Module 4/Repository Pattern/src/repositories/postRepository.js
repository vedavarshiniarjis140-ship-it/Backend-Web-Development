/**
 * Post Repository
 * 
 * Storage-Swap & Future Prisma-Backed Implementation:
 * 
 * What will change when replaced by a Prisma-backed implementation:
 * 1. Storage Backend: The internal in-memory Map (`posts`) and local `nextId` counter will be removed.
 * 2. Database Client: A PrismaClient instance (e.g., `const prisma = new PrismaClient()`) will be imported and used.
 * 3. Method Implementations: The repository methods will delegate directly to Prisma database queries:
 *    - `findAll()` -> `prisma.post.findMany()`
 *    - `findById(id)` -> `prisma.post.findUnique({ where: { id: Number(id) } })`
 *    - `create(fields)` -> `prisma.post.create({ data: fields })`
 *    - `update(id, patch)` -> `prisma.post.update({ where: { id: Number(id) }, data: patch })`
 *    - `remove(id)` -> `prisma.post.delete({ where: { id: Number(id) } })`
 * 4. Asynchronous Execution: Repository methods will become async / return Promises for database I/O.
 * 5. Primary Key & Constraints: ID autoincrementing and data integrity/unique constraints will be handled
 *    by the underlying database schema and Prisma migrations.
 * 
 * What will remain unchanged:
 * 1. Architectural Boundary: The separation of concerns across controller, service, and repository layers.
 * 2. Repository Interface Contract: Callers continue to use the exact five standard operations:
 *    `findAll()`, `findById(id)`, `create(fields)`, `update(id, patch)`, and `remove(id)`.
 * 3. Service Layer (`postService.js`): All business rules, input validations (e.g. required title),
 *    and domain orchestration logic remain untouched.
 * 4. Controller Layer (`postController.js`): HTTP request parsing, response structures (`{ data: ... }`),
 *    and HTTP status codes (200, 201, 204, 404, 422, 500) remain unchanged.
 * 5. External API Contract: External clients calling the REST API experience zero breaking changes.
 */

const postStore = require('../data/postStore');

// Storage-swap proof: Internal store backed by a Map instead of an array
const initialPosts = (postStore && Array.isArray(postStore.posts))
  ? postStore.posts
  : [
      { id: 1, title: 'First post', body: 'Repository boundaries protect change.', authorId: 7 },
      { id: 2, title: 'Second post', body: 'Services should speak in domain language.', authorId: 8 },
    ];

const posts = new Map(initialPosts.map((post) => [post.id, { ...post }]));
let nextId = initialPosts.reduce((max, post) => Math.max(max, post.id), 0) + 1;

function findAll() {
  return Array.from(posts.values()).map((post) => ({ ...post }));
}

function findById(id) {
  const numericId = Number(id);
  const post = posts.get(numericId);
  return post ? { ...post } : null;
}

function create(fields = {}) {
  const post = {
    id: nextId++,
    title: fields.title,
    body: fields.body || '',
    authorId: fields.authorId,
  };
  posts.set(post.id, post);
  return { ...post };
}

function update(id, patch = {}) {
  const numericId = Number(id);
  const post = posts.get(numericId);
  if (!post) return null;
  if (patch.title !== undefined) post.title = patch.title;
  if (patch.body !== undefined) post.body = patch.body;
  if (patch.authorId !== undefined) post.authorId = patch.authorId;
  return { ...post };
}

function remove(id) {
  const numericId = Number(id);
  return posts.delete(numericId);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
