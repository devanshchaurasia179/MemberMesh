export const QUERY_KEYS = {
  MEMBERS: ["members"] as const,
  MEMBER: (id: string) => ["member", id] as const,
};