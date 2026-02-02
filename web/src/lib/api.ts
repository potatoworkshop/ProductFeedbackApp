const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type Feedback = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    votes: number;
    comments: number;
  };
};

export type Comment = {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  parentId?: string | null;
  replyCount?: number;
  replies?: Comment[];
};

export type Vote = {
  userId: string;
  feedbackId: string;
  createdAt: string;
};

export const CURRENT_USER_ID = "placeholder-user";

export type CreateFeedbackInput = {
  title: string;
  description: string;
  category: string;
};

export type CreateCommentInput = {
  body: string;
  parentId?: string | null;
};

export type FeedbackListResponse = {
  items: Feedback[];
  total: number;
  page: number;
  pageSize: number;
};

type FeedbackListParams = {
  category?: string;
  status?: string;
  search?: string;
  sort?: "createdAt" | "votes" | "updatedAt";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchFeedbacks(params: FeedbackListParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  const url = `${API_BASE_URL}/feedbacks${query ? `?${query}` : ""}`;
  return fetchJson<FeedbackListResponse>(url, { cache: "no-store" });
}

export async function fetchFeedback(id: string) {
  const url = `${API_BASE_URL}/feedbacks/${id}`;
  return fetchJson<Feedback>(url, { cache: "no-store" });
}

export async function fetchComments(feedbackId: string) {
  const url = `${API_BASE_URL}/feedbacks/${feedbackId}/comments`;
  return fetchJson<Comment[]>(url, { cache: "no-store" });
}

export async function fetchVotes(feedbackId: string) {
  const url = `${API_BASE_URL}/feedbacks/${feedbackId}/votes`;
  return fetchJson<Vote[]>(url, { cache: "no-store" });
}

export async function createFeedback(input: CreateFeedbackInput) {
  const url = `${API_BASE_URL}/feedbacks`;
  return fetchJson<Feedback>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function createComment(
  feedbackId: string,
  input: CreateCommentInput,
) {
  const url = `${API_BASE_URL}/feedbacks/${feedbackId}/comments`;
  return fetchJson<Comment>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function createVote(feedbackId: string) {
  const url = `${API_BASE_URL}/feedbacks/${feedbackId}/votes`;
  return fetchJson<{ userId: string; feedbackId: string }>(url, {
    method: "POST",
  });
}

export async function removeVote(feedbackId: string) {
  const url = `${API_BASE_URL}/feedbacks/${feedbackId}/votes`;
  return fetchJson<{ userId: string; feedbackId: string }>(url, {
    method: "DELETE",
  });
}
