import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  FeedbackCategory,
  FeedbackStatus,
  PrismaClient,
  UserRole,
} from '@prisma/client';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const baseUsers = [
    { id: 'placeholder-user', name: 'Placeholder User', role: UserRole.USER },
    {
      id: 'placeholder-admin',
      name: 'Placeholder Admin',
      role: UserRole.ADMIN,
    },
    { id: 'demo-user', name: 'Demo User', role: UserRole.USER },
    { id: 'demo-admin', name: 'Demo Admin', role: UserRole.ADMIN },
    { id: 'demo-user-2', name: 'Alex Chen', role: UserRole.USER },
    { id: 'demo-user-3', name: 'Priya Shah', role: UserRole.USER },
    { id: 'demo-user-4', name: 'Mateo Silva', role: UserRole.USER },
    { id: 'demo-user-5', name: 'Nora Kim', role: UserRole.USER },
  ];

  const extraUsers = Array.from({ length: 30 }, (_, index) => {
    const i = index + 6;
    return {
      id: `demo-user-${i}`,
      name: `Demo User ${i}`,
      role: UserRole.USER,
    };
  });

  const users = [...baseUsers, ...extraUsers];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { name: user.name, role: user.role, avatarUrl: null },
      create: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatarUrl: null,
      },
    });
  }

  const statuses: FeedbackStatus[] = [
    FeedbackStatus.SUGGESTION,
    FeedbackStatus.PLANNED,
    FeedbackStatus.IN_PROGRESS,
    FeedbackStatus.LIVE,
    FeedbackStatus.CLOSED,
  ];

  const feedbacks = [
    {
      id: 'demo-feedback-1',
      title: 'Dashboard loads too slowly; first paint takes 6–8 seconds',
      description:
        'The overview page takes a long time to show charts, especially when filtering to the last 12 months. Consider showing a skeleton screen and prioritizing key KPI cards.',
      category: FeedbackCategory.UX,
      status: FeedbackStatus.IN_PROGRESS,
      authorId: users[4].id,
    },
    {
      id: 'demo-feedback-2',
      title: 'Please add one‑click YoY/MoM comparisons',
      description:
        'Comparisons require manual date adjustments. YoY and MoM are used constantly and take too many clicks. Add a toggle next to trend charts and remember the last choice.',
      category: FeedbackCategory.FEATURE,
      status: FeedbackStatus.PLANNED,
      authorId: users[5].id,
    },
    {
      id: 'demo-feedback-3',
      title: 'Charts are clipped on mobile',
      description:
        'On iPhone, the funnel chart labels are cut off and scrolling does not reveal them. Shorten labels or enable horizontal scroll on small screens.',
      category: FeedbackCategory.BUG,
      status: FeedbackStatus.SUGGESTION,
      authorId: users[6].id,
    },
    {
      id: 'demo-feedback-4',
      title: 'Too many filters and no search',
      description:
        'The filter panel has dozens of dimensions, and fields like “Channel” and “Region” are hard to find. Add search and allow favorites.',
      category: FeedbackCategory.UX,
      status: FeedbackStatus.PLANNED,
      authorId: users[7].id,
    },
    {
      id: 'demo-feedback-5',
      title: 'CSV export has inconsistent column order',
      description:
        'Exporting the same report yields a different column order, breaking downstream scripts. Please fix the default order and allow custom columns.',
      category: FeedbackCategory.BUG,
      status: FeedbackStatus.IN_PROGRESS,
      authorId: users[2].id,
    },
    {
      id: 'demo-feedback-6',
      title: 'Need custom dashboard templates',
      description:
        'Different roles need different layouts, but everyone sees the same dashboard. Allow multiple templates and sharing within a team.',
      category: FeedbackCategory.ENHANCEMENT,
      status: FeedbackStatus.SUGGESTION,
      authorId: users[3].id,
    },
    {
      id: 'demo-feedback-7',
      title: 'Metric definitions are unclear',
      description:
        'For example, is “active users” daily or weekly? Add definitions and calculation rules next to chart titles.',
      category: FeedbackCategory.UI,
      status: FeedbackStatus.LIVE,
      authorId: users[1].id,
    },
    {
      id: 'demo-feedback-8',
      title: 'Allow annotations for outliers on charts',
      description:
        'When investigating spikes we annotate screenshots. Please add markers/notes on line charts and allow exporting with annotations.',
      category: FeedbackCategory.FEATURE,
      status: FeedbackStatus.PLANNED,
      authorId: users[8].id,
    },
    {
      id: 'demo-feedback-9',
      title: 'Permissions are too coarse; need department‑level access',
      description:
        'With only admin/user roles, we cannot limit data visibility by department. Please add department or project scoping.',
      category: FeedbackCategory.ENHANCEMENT,
      status: FeedbackStatus.SUGGESTION,
      authorId: users[9].id,
    },
    {
      id: 'demo-feedback-10',
      title: 'Trend charts need a forecast line',
      description:
        'We need a simple projection for reporting. Add optional 7/30‑day forecasts or a historical‑average extrapolation.',
      category: FeedbackCategory.FEATURE,
      status: FeedbackStatus.CLOSED,
      authorId: users[10].id,
    },
  ];

  for (const feedback of feedbacks) {
    await prisma.feedback.upsert({
      where: { id: feedback.id },
      update: {
        title: feedback.title,
        description: feedback.description,
        category: feedback.category,
        status: feedback.status,
        authorId: feedback.authorId,
        deletedAt: null,
      },
      create: {
        id: feedback.id,
        title: feedback.title,
        description: feedback.description,
        category: feedback.category,
        status: feedback.status,
        authorId: feedback.authorId,
      },
    });

    const commentAuthorIds = [users[0].id, users[4].id, users[5].id];

    const comment1Id = `${feedback.id}-c1`;
    const comment2Id = `${feedback.id}-c2`;
    const comment3Id = `${feedback.id}-c3`;

    const commentBodies: Record<string, [string, string, string]> = {
      'demo-feedback-1': [
        'Same here, especially after changing filters.',
        'Consider module-based loading and render KPI cards first.',
        'Maybe default to a smaller time range on first load.',
      ],
      'demo-feedback-2': [
        'YoY/MoM is a weekly meeting staple—too many clicks.',
        'Remembering the last selection would help a lot.',
        'A quick preset or shortcut would be great.',
      ],
      'demo-feedback-3': [
        'We see this too; landscape works but feels bad.',
        'On small screens, move labels into tooltips.',
        'A mobile preview mode would be useful.',
      ],
      'demo-feedback-4': [
        'Filters are growing and fields are hard to find.',
        'Favorite filters would save a lot of time.',
        'Grouping by business domain could help.',
      ],
      'demo-feedback-5': [
        'This breaks our automated report scripts.',
        'Could we get a “column template” setting?',
        'At minimum, keep the default order stable.',
      ],
      'demo-feedback-6': [
        'Different roles care about different metrics.',
        'Sharing templates with the team would be great.',
        'Readonly templates would prevent accidental edits.',
      ],
      'demo-feedback-7': [
        'Metric definitions are questioned a lot.',
        'Add an “info” tooltip next to charts.',
        'Linking to a metric dictionary would be ideal.',
      ],
      'demo-feedback-8': [
        'Annotating outliers helps with retros.',
        'Exporting images with annotations would be helpful.',
        'Multiple colors for different note types would be great.',
      ],
      'demo-feedback-9': [
        'Permissions are too coarse to roll out broadly.',
        'Department-level scoping is the minimum.',
        'Project-level isolation would be ideal.',
      ],
      'demo-feedback-10': [
        'A simple forecast line is enough for reporting.',
        'Start with a lightweight average-based projection.',
        'Add a note that forecasts are for reference.',
      ],
    };

    const [c1, c2, c3] = commentBodies[feedback.id] ?? [
      `Additional context for "${feedback.title}".`,
      'Support this—looking forward to the update.',
      'Can we get an ETA or priority?',
    ];

    await prisma.comment.upsert({
      where: { id: comment1Id },
      update: {
        body: c1,
        feedbackId: feedback.id,
        authorId: commentAuthorIds[0],
        parentId: null,
        deletedAt: null,
      },
      create: {
        id: comment1Id,
        body: c1,
        feedbackId: feedback.id,
        authorId: commentAuthorIds[0],
      },
    });

    await prisma.comment.upsert({
      where: { id: comment2Id },
      update: {
        body: c2,
        feedbackId: feedback.id,
        authorId: commentAuthorIds[1],
        parentId: comment1Id,
        deletedAt: null,
      },
      create: {
        id: comment2Id,
        body: c2,
        feedbackId: feedback.id,
        authorId: commentAuthorIds[1],
        parentId: comment1Id,
      },
    });

    await prisma.comment.upsert({
      where: { id: comment3Id },
      update: {
        body: c3,
        feedbackId: feedback.id,
        authorId: commentAuthorIds[2],
        parentId: null,
        deletedAt: null,
      },
      create: {
        id: comment3Id,
        body: c3,
        feedbackId: feedback.id,
        authorId: commentAuthorIds[2],
      },
    });

    const statusLogCount = Math.min(3, statuses.length - 1);
    for (let i = 0; i < statusLogCount; i += 1) {
      const fromStatus = statuses[i];
      const toStatus = statuses[i + 1];
      const logId = `${feedback.id}-status-${i + 1}`;

      await prisma.feedbackStatusLog.upsert({
        where: { id: logId },
        update: {
          feedbackId: feedback.id,
          from: fromStatus,
          to: toStatus,
          changedBy: 'demo-admin',
        },
        create: {
          id: logId,
          feedbackId: feedback.id,
          from: fromStatus,
          to: toStatus,
          changedBy: 'demo-admin',
        },
      });
    }
  }

  const voteIterations = 200;
  for (let i = 0; i < voteIterations; i += 1) {
    const voter = users[Math.floor(Math.random() * users.length)];
    const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];

    await prisma.vote.upsert({
      where: {
        userId_feedbackId: {
          userId: voter.id,
          feedbackId: feedback.id,
        },
      },
      update: {},
      create: {
        userId: voter.id,
        feedbackId: feedback.id,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
